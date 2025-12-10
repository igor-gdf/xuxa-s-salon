import prisma from '../../utils/prisma'
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Apenas admin pode modificar serviços
  requireAdmin(event)

  const method = event.method
  const id = parseInt(event.context.params?.id || '0')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID inválido'
    })
  }

  if (method === 'PUT') {
    try {
      const body = await readBody(event)

      const service = await prisma.service.update({
        where: { id },
        data: {
          name: body.name,
          duration: body.duration ? parseInt(body.duration) : undefined,
          price: body.price ? parseInt(body.price) : undefined
        }
      })

      return service
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw createError({
          statusCode: 404,
          message: 'Serviço não encontrado'
        })
      }

      throw createError({
        statusCode: 500,
        message: 'Erro ao atualizar serviço'
      })
    }
  }

  if (method === 'DELETE') {
    try {
      await prisma.service.delete({
        where: { id }
      })

      return { success: true, message: 'Serviço deletado com sucesso' }
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw createError({
          statusCode: 404,
          message: 'Serviço não encontrado'
        })
      }

      throw createError({
        statusCode: 500,
        message: 'Erro ao deletar serviço'
      })
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Método não permitido'
  })
})
