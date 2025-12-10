export default defineNuxtRouteMiddleware((to, from) => {
  const { isAdmin, isAuthenticated } = useAuth()

  // Se não está autenticado ou não é admin, redirecionar
  if (!isAuthenticated.value || !isAdmin.value) {
    return navigateTo('/login')
  }
})
