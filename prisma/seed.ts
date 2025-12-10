import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@xuxa.salon' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@xuxa.salon',
      phone: '11999999999',
      password: adminPassword,
      role: 'admin'
    }
  })
  console.log('✅ Admin criado:', admin.email)

  // Criar usuário cliente de teste
  const clientPassword = await bcrypt.hash('cliente123', 10)
  const client = await prisma.user.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      name: 'Maria Silva',
      email: 'cliente@teste.com',
      phone: '11988888888',
      password: clientPassword,
      role: 'client'
    }
  })
  console.log('✅ Cliente criado:', client.email)

  // Criar serviços
  const services = [
    {
      name: 'Corte de Cabelo',
      duration: 60,
      price: 80.00,
      description: 'Corte personalizado com acabamento profissional'
    },
    {
      name: 'Escova + Finalização',
      duration: 90,
      price: 120.00,
      description: 'Escova modeladora com finalização impecável'
    },
    {
      name: 'Coloração Raiz',
      duration: 120,
      price: 150.00,
      description: 'Retoque de raiz com produtos de alta qualidade'
    },
    {
      name: 'Make Completa',
      duration: 60,
      price: 100.00,
      description: 'Maquiagem completa para qualquer ocasião'
    },
    {
      name: 'Hidratação Profunda',
      duration: 90,
      price: 90.00,
      description: 'Tratamento intensivo para recuperação capilar'
    }
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: services.indexOf(service) + 1 },
      update: {},
      create: service
    })
  }
  console.log('✅ Serviços criados:', services.length)

  // Criar horários disponíveis (Segunda a Sexta: 8h às 18h)
  const timeSlots = []
  for (let day = 1; day <= 5; day++) {
    for (let hour = 8; hour < 18; hour++) {
      timeSlots.push({
        dayOfWeek: day,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        active: true
      })
    }
  }

  for (const slot of timeSlots) {
    await prisma.availableSlot.upsert({
      where: {
        dayOfWeek_startTime: {
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime
        }
      },
      update: {},
      create: slot
    })
  }
  console.log('✅ Horários disponíveis criados:', timeSlots.length)

  // Criar agendamentos de exemplo para o cliente
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(14, 0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(10, 0, 0, 0)

  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  lastWeek.setHours(15, 0, 0, 0)

  const bookingsData = [
    {
      userId: client.id,
      serviceId: 1, // Corte de Cabelo
      date: tomorrow,
      status: 'confirmed',
      notes: 'Preferência por corte médio'
    },
    {
      userId: client.id,
      serviceId: 2, // Escova + Finalização
      date: nextWeek,
      status: 'pending',
      notes: null
    },
    {
      userId: client.id,
      serviceId: 4, // Make Completa
      date: lastWeek,
      status: 'completed',
      notes: null
    }
  ]

  for (const booking of bookingsData) {
    await prisma.booking.create({
      data: booking
    })
  }
  console.log('✅ Agendamentos de exemplo criados:', bookingsData.length)

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
