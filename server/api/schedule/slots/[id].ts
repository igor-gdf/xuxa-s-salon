import prisma from '../../../utils/prisma'
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const method = event.method
  const id = parseInt(event.context.params?.id as string)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID do horário é obrigatório'
    })
  }

  if (method === 'PUT') {
    const user = requireAdmin(event)

    try {
      const body = await readBody(event)

      const slot = await prisma.availableSlot.update({
        where: { id },
        data: {
          dayOfWeek: body.dayOfWeek !== undefined ? parseInt(body.dayOfWeek) : undefined,
          startTime: body.startTime,
          endTime: body.endTime,
          active: body.active
        }
      })

      return slot
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw createError({
          statusCode: 404,
          message: 'Horário não encontrado'
        })
      }

      throw createError({
        statusCode: 500,
        message: 'Erro ao atualizar horário'
      })
    }
  }

  if (method === 'DELETE') {
    const user = requireAdmin(event)

    try {
      await prisma.availableSlot.delete({
        where: { id }
      })

      return { success: true }
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw createError({
          statusCode: 404,
          message: 'Horário não encontrado'
        })
      }

      throw createError({
        statusCode: 500,
        message: 'Erro ao excluir horário'
      })
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Método não permitido'
  })
})
