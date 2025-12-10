<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

const { user, isAdmin, logout } = useAuth()
const router = useRouter()

interface Booking {
  id: number
  date: string
  status: string
  notes?: string
  user: {
    name: string
    phone: string
  }
  service: {
    name: string
    duration: number
    price: number
  }
}

const { data: bookings, refresh } = await useFetch<Booking[]>('/api/bookings', {
  headers: {
    Authorization: `Bearer ${useCookie('auth_token').value}`
  }
})

const stats = computed(() => {
  if (!bookings.value) return { total: 0, pending: 0, confirmed: 0, completed: 0, revenue: 0 }
  
  return {
    total: bookings.value.length,
    pending: bookings.value.filter(b => b.status === 'pending').length,
    confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
    completed: bookings.value.filter(b => b.status === 'completed').length,
    revenue: bookings.value
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.service.price, 0)
  }
})

const recentBookings = computed(() => {
  if (!bookings.value) return []
  return [...bookings.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(price)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  }
  return labels[status] || status
}

const updateBookingStatus = async (bookingId: number, newStatus: string) => {
  try {
    await $fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      body: { status: newStatus },
      headers: {
        Authorization: `Bearer ${useCookie('auth_token').value}`
      }
    })
    await refresh()
  } catch (error: any) {
    alert(error.data?.message || 'Erro ao atualizar status')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blush-50 via-white to-blush-100 py-8">
    <main class="max-w-7xl mx-auto px-4 py-4 space-y-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-ink">Painel Administrativo</h1>
          <p class="text-sm text-slate-600">Bem-vindo, {{ user?.name }}</p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink 
            to="/"
            class="btn btn-ghost"
          >
            ← Site
          </NuxtLink>
          <button
            @click="logout"
            class="btn btn-danger"
          >
            Sair
          </button>
        </div>
      </div>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="rounded-2xl border border-white/70 bg-white p-6 shadow-sm">
          <div class="text-3xl font-bold text-ink mb-1">{{ stats.total }}</div>
          <div class="text-sm text-slate-600">Total</div>
        </div>
        <div class="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <div class="text-3xl font-bold text-yellow-800 mb-1">{{ stats.pending }}</div>
          <div class="text-sm text-yellow-700">Pendentes</div>
        </div>
        <div class="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <div class="text-3xl font-bold text-blue-800 mb-1">{{ stats.confirmed }}</div>
          <div class="text-sm text-blue-700">Confirmados</div>
        </div>
        <div class="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <div class="text-3xl font-bold text-green-800 mb-1">{{ stats.completed }}</div>
          <div class="text-sm text-green-700">Concluídos</div>
        </div>
        <div class="rounded-2xl border border-blush-200 bg-blush-50 p-6 shadow-sm">
          <div class="text-2xl font-bold text-blush-800 mb-1">{{ formatPrice(stats.revenue) }}</div>
          <div class="text-sm text-blush-700">Receita</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid md:grid-cols-3 gap-4">
        <NuxtLink
          to="/admin/calendar"
          class="group rounded-2xl border border-white/70 bg-white p-6 shadow-sm hover:shadow-lg transition text-center"
        >
          <div class="text-4xl mb-3">📅</div>
          <h3 class="text-lg font-bold text-ink mb-1">Calendário</h3>
          <p class="text-sm text-slate-600">Visualize agendamentos por data</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/services"
          class="group rounded-2xl border border-white/70 bg-white p-6 shadow-sm hover:shadow-lg transition text-center"
        >
          <div class="text-4xl mb-3">💇</div>
          <h3 class="text-lg font-bold text-ink mb-1">Serviços</h3>
          <p class="text-sm text-slate-600">Gerenciar lista de serviços</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/schedule"
          class="group rounded-2xl border border-white/70 bg-white p-6 shadow-sm hover:shadow-lg transition text-center"
        >
          <div class="text-4xl mb-3">⏰</div>
          <h3 class="text-lg font-bold text-ink mb-1">Horários</h3>
          <p class="text-sm text-slate-600">Configurar dias e horários</p>
        </NuxtLink>
      </div>

      <!-- Recent Bookings -->
      <div class="rounded-2xl border border-white/70 bg-white p-6 shadow-lg">
        <h2 class="text-2xl font-bold text-ink mb-6">Agendamentos Recentes</h2>
        
        <div v-if="recentBookings.length > 0" class="space-y-3">
          <div
            v-for="booking in recentBookings"
            :key="booking.id"
            class="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blush-300 transition"
          >
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="font-bold text-ink">{{ booking.user.name }}</span>
                <span 
                  class="px-3 py-1 rounded-full text-xs font-semibold border"
                  :class="getStatusColor(booking.status)"
                >
                  {{ getStatusLabel(booking.status) }}
                </span>
              </div>
              <div class="text-sm text-slate-600">
                <p class="font-semibold text-blush-700">{{ booking.service.name }}</p>
                <p>{{ formatDate(booking.date) }} • {{ booking.user.phone }}</p>
                <p class="font-semibold text-ink mt-1">{{ formatPrice(booking.service.price) }}</p>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="flex gap-2 ml-4">
              <button
                v-if="booking.status === 'pending'"
                @click="updateBookingStatus(booking.id, 'confirmed')"
                class="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
                title="Confirmar"
              >
                ✓ Confirmar
              </button>
              <button
                v-if="booking.status === 'confirmed'"
                @click="updateBookingStatus(booking.id, 'completed')"
                class="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
                title="Concluir"
              >
                ✓ Concluir
              </button>
              <button
                v-if="booking.status === 'confirmed' || booking.status === 'completed'"
                @click="updateBookingStatus(booking.id, 'pending')"
                class="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600 transition"
                title="Voltar para pendente"
              >
                ⟲ Pendente
              </button>
              <button
                v-if="booking.status !== 'cancelled' && booking.status !== 'completed'"
                @click="updateBookingStatus(booking.id, 'cancelled')"
                class="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
                title="Cancelar"
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-slate-500">
          Nenhum agendamento ainda
        </div>
      </div>
    </main>
  </div>
</template>
