import prisma from '../../utils/prisma'
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const method = event.method

  if (method !== 'PUT') {
    throw createError({
      statusCode: 405,
      message: 'Método não permitido'
    })
  }

  try {
    const id = parseInt(event.context.params?.id || '0')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID inválido'
      })
    }

    // Verificar se o agendamento pertence ao usuário ou se é admin
    const existingBooking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!existingBooking) {
      throw createError({
        statusCode: 404,
        message: 'Agendamento não encontrado'
      })
    }

    // Apenas o dono ou admin pode modificar
    if (user.role !== 'admin' && existingBooking.userId !== user.userId) {
      throw createError({
        statusCode: 403,
        message: 'Você não tem permissão para modificar este agendamento'
      })
    }

    const body = await readBody(event)

    // Validação de status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (body.status && !validStatuses.includes(body.status)) {
      throw createError({
        statusCode: 400,
        message: 'Status inválido. Use: pending, confirmed, cancelled ou completed'
      })
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: body.status,
        date: body.date ? new Date(body.date) : undefined,
        notes: body.notes
      },
      include: {
        user: true,
        service: true
      }
    })

    return booking
  } catch (error: any) {
    if (error.statusCode) throw error

    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        message: 'Agendamento não encontrado'
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Erro ao atualizar agendamento'
    })
  }
})
