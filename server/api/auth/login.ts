import prisma from '../../utils/prisma'
import { defineEventHandler, readBody, createError } from 'h3'
import { comparePassword } from '../../utils/password'
import { generateToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Validação
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email e senha são obrigatórios'
      })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Credenciais inválidas'
      })
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'Credenciais inválidas'
      })
    }

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Erro ao fazer login'
    })
  }
})
