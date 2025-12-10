import { defineEventHandler } from 'h3'
import { getUserFromToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const user = getUserFromToken(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  // Buscar dados completos do usuário
  const fullUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true
    }
  })

  if (!fullUser) {
    throw createError({
      statusCode: 404,
      message: 'Usuário não encontrado'
    })
  }

  return fullUser
})
