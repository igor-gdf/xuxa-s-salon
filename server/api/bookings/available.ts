import prisma from '../../utils/prisma'
import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { date, serviceId } = query

    // Validação
    if (!date || !serviceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Data e serviço são obrigatórios'
      })
    }

    // Buscar o serviço para pegar a duração
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId as string) }
    })

    if (!service) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Serviço não encontrado'
      })
    }


    // Criar data inicial e final para o dia
    const selectedDate = new Date(date as string)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)
    const now = new Date()

    // Verificar se existe slot cadastrado para o dia da semana
    const dayOfWeek = selectedDate.getDay() // 0 = domingo
    const slots = await prisma.availableSlot.findMany({
      where: {
        dayOfWeek,
        active: true
      },
      orderBy: [{ startTime: 'asc' }]
    })

    if (!slots.length) {
      // Nenhum horário cadastrado para esse dia
      return {
        date: date,
        serviceId: parseInt(serviceId as string),
        serviceName: service.name,
        serviceDuration: service.duration,
        availableSlots: [],
        totalSlots: 0
      }
    }

    // Buscar agendamentos do dia que não estão cancelados
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'cancelled'
        }
      },
      select: {
        date: true,
        service: {
          select: {
            duration: true
          }
        }
      }
    })

    // Gerar horários disponíveis com base nos slots cadastrados
    const availableSlots: string[] = []
    const bookedTimes = new Set<string>()

    bookings.forEach((booking: any) => {
      const bookingDate = new Date(booking.date)
      const hour = bookingDate.getHours().toString().padStart(2, '0') + ':' + bookingDate.getMinutes().toString().padStart(2, '0')
      const duration = booking.service.duration
      const hoursToBlock = Math.ceil(duration / 60)
      // Bloquear os horários ocupados
      for (let i = 0; i < hoursToBlock; i++) {
        const blockedHour = (bookingDate.getHours() + i).toString().padStart(2, '0') + ':' + bookingDate.getMinutes().toString().padStart(2, '0')
        bookedTimes.add(blockedHour)
      }
    })

    for (const slot of slots) {
      // slot.startTime, slot.endTime
      const [startHour, startMinute] = slot.startTime.split(':').map(Number)
      const slotDate = new Date(selectedDate)
      slotDate.setHours(startHour, startMinute, 0, 0)

      // Verificar se o horário já passou
      if (slotDate <= now) continue

      // Verificar se está ocupado
      if (!bookedTimes.has(slot.startTime)) {
        availableSlots.push(slotDate.toISOString())
      }
    }

    return {
      date: date,
      serviceId: parseInt(serviceId as string),
      serviceName: service.name,
      serviceDuration: service.duration,
      availableSlots,
      totalSlots: availableSlots.length
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar horários disponíveis'
    })
  }
})
