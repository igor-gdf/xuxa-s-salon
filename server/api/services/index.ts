import prisma from '../../utils/prisma'
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    try {
      const services = await prisma.service.findMany({
        where: { active: true },
        orderBy: { id: 'asc' }
      })
      return services
    } catch (error) {
      throw createError({
        statusCode: 500,
        message: 'Erro ao buscar serviços'
      })
    }
  }

  if (method === 'POST') {
    // Apenas admin pode criar serviços
    requireAdmin(event)

    try {
      const body = await readBody(event)
      
      // Validação básica
      if (!body.name || !body.duration || !body.price) {
        throw createError({
          statusCode: 400,
          message: 'Nome, duração e preço são obrigatórios'
        })
      }

      const service = await prisma.service.create({
        data: {
          name: body.name,
          duration: parseInt(body.duration),
          price: parseInt(body.price),
          description: body.description || null
        }
      })

      return service
    } catch (error: any) {
      if (error.statusCode) throw error
      
      throw createError({
        statusCode: 500,
        message: 'Erro ao criar serviço'
      })
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Método não permitido'
  })
})
