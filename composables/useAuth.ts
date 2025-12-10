export interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'admin' | 'client'
  createdAt: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth_user', () => null)
  const token = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7 // 7 dias
  })

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      user.value = response.user
      token.value = response.token

      return { success: true, user: response.user }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao fazer login'
      }
    }
  }

  const register = async (data: {
    name: string
    email: string
    phone: string
    password: string
  }) => {
    try {
      const response = await $fetch<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: data
      })

      user.value = response.user
      token.value = response.token

      return { success: true, user: response.user }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao criar conta'
      }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    navigateTo('/login')
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      const response = await $fetch<User>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      user.value = response
    } catch (error) {
      // Token inválido, fazer logout
      logout()
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUser
  }
}
