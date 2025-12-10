<script setup lang="ts">
const { isAuthenticated, isAdmin } = useAuth()
const route = useRoute()
const showSidebar = ref(false)

const navLinks = computed(() => {
  const baseLinks = [
    { label: 'Início', to: '/', icon: '🏠' },
    { label: 'Serviços', to: '/services', icon: '✂️' },
  ]

  const userLinks = isAuthenticated.value && !isAdmin.value
    ? [{ label: 'Meus Agendamentos', to: '/my-bookings', icon: '📋' }]
    : []

  const adminLinks = isAdmin.value
    ? [
        { label: 'Dashboard', to: '/admin', icon: '📊' },
        { label: 'Calendário', to: '/admin/calendar', icon: '📅' },
        { label: 'Serviços', to: '/admin/services', icon: '⚙️' },
        { label: 'Horários', to: '/admin/schedule', icon: '⏰' }
      ]
    : []

  return [...baseLinks, ...userLinks, ...adminLinks]
})

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

watch(() => route.path, () => {
  showSidebar.value = false
})
</script>

<template>
  <!-- Desktop Sidebar -->
  <aside class="hidden border-r border-slate-200 bg-white md:top-16 md:block md:h-[calc(100vh-64px)] md:w-64 md:overflow-y-auto">
    <nav class="space-y-1 p-4">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition"
        :class="{
          'bg-blush-100 text-blush-700': isActive(link.to),
          'text-slate-700 hover:bg-slate-100': !isActive(link.to)
        }"
      >
        <span class="text-lg">{{ link.icon }}</span>
        <span>{{ link.label }}</span>
      </NuxtLink>
    </nav>
  </aside>

  <!-- Mobile Bottom Navigation -->
  <nav class="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white md:hidden">
    <div class="flex items-center justify-around">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-1 flex-col items-center justify-center gap-1 px-3 py-3 text-xs font-medium transition"
        :class="{
          'text-blush-600': isActive(link.to),
          'text-slate-500': !isActive(link.to)
        }"
      >
        <span class="text-xl">{{ link.icon }}</span>
        <span class="hidden sm:inline">{{ link.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
