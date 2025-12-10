import prisma from '../../utils/prisma'
import { defineEventHandler, readBody, createError } from 'h3'
import { hashPassword } from '../../utils/password'
import { generateToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, phone, password } = body

    // Validação
    if (!name || !email || !phone || !password) {
      throw createError({
        statusCode: 400,
        message: 'Todos os campos são obrigatórios'
      })
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Email já cadastrado'
      })
    }

    // Criar usuário
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'client' // padrão é cliente
      }
    })

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
      message: 'Erro ao criar usuário'
    })
  }
})
