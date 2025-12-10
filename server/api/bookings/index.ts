import prisma from '../../utils/prisma'
import { defineEventHandler, readBody, createError, getQuery } from 'h3'
import { requireAuth, requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    // Admin pode ver todos, usuário comum só vê os seus
    const user = requireAuth(event)

    try {
      const query = getQuery(event)
      const { userId, serviceId, status } = query

      const where: any = {}

      // Se não é admin, só mostra agendamentos do próprio usuário
      if (user.role !== 'admin') {
        where.userId = user.userId
      } else {
        // Admin pode filtrar por userId
        if (userId) where.userId = parseInt(userId as string)
      }

      if (serviceId) where.serviceId = parseInt(serviceId as string)
      if (status) where.status = status as string

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          user: true,
          service: true
        },
        orderBy: { date: 'asc' }
      })

      return bookings
    } catch (error) {
      throw createError({
        statusCode: 500,
        message: 'Erro ao buscar agendamentos'
      })
    }
  }

  if (method === 'POST') {
    // Usuário precisa estar logado para criar agendamento
    const user = requireAuth(event)

    try {
      const body = await readBody(event)

      console.log('Recebendo agendamento:', { body, user })

      // Validação básica
      if (!body.date || !body.serviceId) {
        throw createError({
          statusCode: 400,
          message: 'Data e serviço são obrigatórios'
        })
      }

      // Usar o ID do usuário logado
      const userId = user.userId

      // Verificar se o serviço existe
      const service = await prisma.service.findUnique({
        where: { id: parseInt(body.serviceId) }
      })

      if (!service) {
        throw createError({
          statusCode: 400,
          message: 'Serviço não encontrado'
        })
      }

      // Verificar se o horário está disponível
      const bookingDate = new Date(body.date)
      
      console.log('Data do agendamento:', {
        input: body.date,
        parsed: bookingDate,
        isValid: !isNaN(bookingDate.getTime())
      })

      const existingBooking = await prisma.booking.findFirst({
        where: {
          date: bookingDate,
          status: { not: 'cancelled' }
        }
      })

      if (existingBooking) {
        throw createError({
          statusCode: 409,
          message: 'Horário não disponível'
        })
      }

      // Criar o agendamento
      const booking = await prisma.booking.create({
        data: {
          date: bookingDate,
          userId: userId,
          serviceId: service.id,
          status: body.status || 'pending',
          notes: body.notes || null
        },
        include: {
          user: true,
          service: true
        }
      })

      return booking
    } catch (error: any) {
      if (error.statusCode) throw error

      throw createError({
        statusCode: 500,
        message: 'Erro ao criar agendamento'
      })
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Método não permitido'
  })
})
