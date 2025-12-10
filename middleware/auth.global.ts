import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const { isAuthenticated, fetchUser, user, token } = useAuth()

  // Rotas públicas
  const publicRoutes = ['/', '/login', '/register', '/services', '/my-bookings']
  
  // Rotas protegidas por middleware próprio
  const protectedRoutes = ['/admin']
  
  // Se tem token mas não tem usuário carregado, busca os dados
  if (token.value && !user.value) {
    try {
      await fetchUser()
    } catch (error) {
      // Token inválido
      token.value = null
    }
  }

  // Se a rota é pública, permitir acesso
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // Se a rota tem middleware próprio, deixar passar
  if (protectedRoutes.some(route => to.path.startsWith(route))) {
    return
  }

  // Se não está autenticado e tenta acessar rota protegida
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
