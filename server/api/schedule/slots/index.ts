import prisma from '../../../utils/prisma'
import { defineEventHandler, readBody, createError, getQuery } from 'h3'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    try {
      const slots = await prisma.availableSlot.findMany({
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      })

      return slots
    } catch (error) {
      throw createError({
        statusCode: 500,
        message: 'Erro ao buscar horários disponíveis'
      })
    }
  }

  if (method === 'POST') {
    const user = requireAdmin(event)

    try {
      const body = await readBody(event)

      if (!body.dayOfWeek && body.dayOfWeek !== 0) {
        throw createError({
          statusCode: 400,
          message: 'Dia da semana é obrigatório'
        })
      }

      if (!body.startTime || !body.endTime) {
        throw createError({
          statusCode: 400,
          message: 'Horários de início e fim são obrigatórios'
        })
      }

      // Verificar se já existe um horário conflitante
      const existingSlot = await prisma.availableSlot.findFirst({
        where: {
          dayOfWeek: parseInt(body.dayOfWeek),
          OR: [
            {
              AND: [
                { startTime: { lte: body.startTime } },
                { endTime: { gt: body.startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: body.endTime } },
                { endTime: { gte: body.endTime } }
              ]
            }
          ]
        }
      })

      if (existingSlot) {
        throw createError({
          statusCode: 409,
          message: 'Já existe um horário que conflita com este período'
        })
      }

      const slot = await prisma.availableSlot.create({
        data: {
          dayOfWeek: parseInt(body.dayOfWeek),
          startTime: body.startTime,
          endTime: body.endTime,
          active: body.active !== undefined ? body.active : true
        }
      })

      return slot
    } catch (error: any) {
      if (error.statusCode) throw error

      throw createError({
        statusCode: 500,
        message: 'Erro ao criar horário disponível'
      })
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Método não permitido'
  })
})
