import { H3Event, createError } from 'h3'
import { getUserFromToken } from '../utils/jwt'

export const requireAuth = (event: H3Event) => {
  const user = getUserFromToken(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado. Faça login para continuar.'
    })
  }

  // Adiciona o usuário ao contexto do evento
  event.context.user = user
  return user
}

export const requireAdmin = (event: H3Event) => {
  const user = requireAuth(event)

  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado. Apenas administradores.'
    })
  }

  return user
}
