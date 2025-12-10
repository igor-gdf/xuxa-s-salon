<script setup lang="ts">
const { user, isAuthenticated, logout, isAdmin } = useAuth()
const route = useRoute()
const router = useRouter()
const showMenu = ref(false)
const showSidebar = ref(false)

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const getPageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Início',
    '/services': 'Serviços',
    '/schedule/date': 'Novo Agendamento',
    '/my-bookings': 'Meus Agendamentos',
    '/profile': 'Perfil',
    '/admin': 'Painel Administrativo',
    '/admin/calendar': 'Calendário',
    '/admin/services': 'Serviços',
    '/admin/schedule': 'Horários',
    '/login': 'Login',
    '/register': 'Cadastro'
  }
  return titles[route.path] || 'Xuxa\'s Salon'
})
</script>

<template>
  <header class="top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
    <div class="mx-auto flex items-center justify-between px-4 py-4 md:px-6">
      <!-- Logo / Home -->
      <NuxtLink to="/" class="flex items-center gap-2">

        <span class="hidden text-lg font-bold text-ink sm:inline">Xuxa's Salon</span>
      </NuxtLink>

      <!-- Page Title (Mobile) -->
      <span class="text-sm font-semibold text-slate-700 md:hidden">{{ getPageTitle }}</span>

      <!-- User Menu / Auth Links -->
      <div class="flex items-center gap-3">
        <!-- Admin Badge -->
        <span v-if="isAdmin" class="hidden rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 sm:inline">
          Admin
        </span>

        <!-- User Menu Dropdown -->
        <div v-if="isAuthenticated" class="relative">
          <button
            @click="showMenu = !showMenu"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-blush-600 text-sm font-semibold text-white transition hover:shadow-md"
            :title="user?.name"
          >
            {{ user?.name?.charAt(0).toUpperCase() }}
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showMenu"
              class="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg"
            >
              <div class="border-b border-slate-200 px-4 py-3">
                <p class="text-sm font-semibold text-ink">{{ user?.name }}</p>
                <p class="text-xs text-slate-500">{{ user?.email }}</p>
              </div>
              <nav class="space-y-1 p-2">
                <NuxtLink
                  to="/my-bookings"
                  class="block rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 flex items-center gap-2"
                  @click="showMenu = false"
                >
                  � Meus Agendamentos
                </NuxtLink>
                <button
                  @click="handleLogout"
                  class="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 flex items-center gap-2"
                >
                  🚪 Sair
                </button>
              </nav>
            </div>
          </Transition>
        </div>

        <!-- Login / Register Links -->
        <div v-else class="flex gap-2">
          <NuxtLink
            to="/login"
            class="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Entrar
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>
