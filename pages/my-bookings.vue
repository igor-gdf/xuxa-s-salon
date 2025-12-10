<script setup lang="ts">
definePageMeta({
  middleware: 'my-bookings'
})

const { user, isAuthenticated } = useAuth()

interface Booking {
  id: number
  date: string
  status: string
  notes?: string
  service: {
    name: string
    description: string
    duration: number
    price: number
  }
}

const token = useCookie('auth_token')
const bookings = ref<Booking[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    if (!token.value) {
      error.value = 'Token não encontrado. Por favor, faça login novamente.'
      loading.value = false
      return
    }

    const response = await fetch('/api/bookings', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        error.value = 'Sessão expirada. Por favor, faça login novamente.'
        navigateTo('/login')
        return
      }
      throw new Error(`Erro ${response.status}`)
    }

    const data = await response.json()
    bookings.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    console.error('Erro ao carregar agendamentos:', err)
    error.value = 'Erro ao carregar agendamentos. Tente novamente.'
  } finally {
    loading.value = false
  }
})

const filterStatus = ref<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')

const filteredBookings = computed(() => {
  if (!bookings.value) return []
  const filtered = filterStatus.value === 'all' 
    ? bookings.value 
    : bookings.value.filter(b => b.status === filterStatus.value)
  return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const stats = computed(() => {
  if (!bookings.value) return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  return {
    total: bookings.value.length,
    pending: bookings.value.filter(b => b.status === 'pending').length,
    confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
    completed: bookings.value.filter(b => b.status === 'completed').length,
    cancelled: bookings.value.filter(b => b.status === 'cancelled').length
  }
})

const upcomingBookings = computed(() => {
  if (!bookings.value) return []
  const now = new Date()
  return bookings.value
    .filter(b => new Date(b.date) > now && (b.status === 'pending' || b.status === 'confirmed'))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
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

const cancelBooking = async (bookingId: number) => {
  if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return
  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelled' })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao cancelar')
    }

    const listResponse = await fetch('/api/bookings', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    
    if (listResponse.ok) {
      const data = await listResponse.json()
      bookings.value = Array.isArray(data) ? data : []
    }
  } catch (err: any) {
    alert(err.message || 'Erro ao cancelar agendamento')
  }
}

const canCancel = (booking: Booking) => {
  const bookingDate = new Date(booking.date)
  const now = new Date()
  const hoursDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursDiff > 0 && booking.status !== 'cancelled' && booking.status !== 'completed'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-ink">Meus Agendamentos</h1>
      <p class="text-slate-600">Visualize e gerencie seus agendamentos</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <p class="font-semibold">❌ {{ error }}</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="text-center py-10">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-ink border-r-transparent"></div>
      <p class="mt-2 text-slate-600">Carregando agendamentos...</p>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <div class="text-2xl font-bold text-ink">{{ stats.total }}</div>
          <div class="text-xs text-slate-600 mt-1">Total</div>
        </div>
        <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
          <div class="text-2xl font-bold text-yellow-800">{{ stats.pending }}</div>
          <div class="text-xs text-yellow-700 mt-1">Pendentes</div>
        </div>
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
          <div class="text-2xl font-bold text-blue-800">{{ stats.confirmed }}</div>
          <div class="text-xs text-blue-700 mt-1">Confirmados</div>
        </div>
        <div class="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <div class="text-2xl font-bold text-green-800">{{ stats.completed }}</div>
          <div class="text-xs text-green-700 mt-1">Concluídos</div>
        </div>
        <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <div class="text-2xl font-bold text-red-800">{{ stats.cancelled }}</div>
          <div class="text-xs text-red-700 mt-1">Cancelados</div>
        </div>
      </div>

      <!-- Upcoming Bookings -->
      <div v-if="upcomingBookings.length > 0" class="space-y-4">
        <h2 class="text-lg font-bold text-ink">Próximos Agendamentos</h2>
        <div class="space-y-3">
          <div
            v-for="booking in upcomingBookings"
            :key="booking.id"
            class="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-bold text-ink">{{ booking.service.name }}</h3>
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-semibold" :class="getStatusColor(booking.status)">
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </div>
                <p class="text-sm text-slate-600 flex items-center gap-1">
                  📅 {{ formatDate(booking.date) }} às {{ formatTime(booking.date) }}
                </p>
                <p class="text-sm text-slate-600 mt-1 flex items-center gap-1">
                  ⏰ {{ booking.service.duration }} min • {{ formatPrice(booking.service.price) }}
                </p>
              </div>
              <button
                v-if="canCancel(booking)"
                @click="cancelBooking(booking.id)"
                class="btn btn-outline text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Bookings -->
      <div v-else class="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p class="text-slate-600 mb-4">Você ainda não tem agendamentos</p>
      </div>

      <!-- Filter Section -->
      <div v-if="bookings.length > 0" class="space-y-4">
        <div class="space-y-2">
          <h2 class="text-lg font-bold text-ink">Histórico</h2>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="status in ['all', 'pending', 'confirmed', 'completed', 'cancelled']"
              :key="status"
              @click="filterStatus = status as any"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition"
              :class="{
                'bg-ink text-white': filterStatus === status,
                'bg-slate-100 text-slate-700 hover:bg-slate-200': filterStatus !== status
              }"
            >
              {{ status === 'all' ? 'Todos' : getStatusLabel(status) }}
            </button>
          </div>
        </div>

        <!-- Bookings List -->
        <div class="space-y-3">
          <div
            v-for="booking in filteredBookings"
            :key="booking.id"
            class="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-bold text-ink">{{ booking.service.name }}</h3>
                  <span
                    class="px-2 py-1 rounded text-xs font-semibold"
                    :class="getStatusColor(booking.status)"
                  >
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </div>
                <p class="text-sm text-slate-600 flex items-center gap-1">
                  📅 {{ formatDate(booking.date) }} às {{ formatTime(booking.date) }}
                </p>
                <p class="text-sm text-slate-600 mt-1 flex items-center gap-1">
                  ⏰ {{ booking.service.duration }} min • {{ formatPrice(booking.service.price) }}
                </p>
              </div>
              <button
                v-if="canCancel(booking)"
                @click="cancelBooking(booking.id)"
                class="px-3 py-2 rounded text-xs font-semibold text-red-600 hover:bg-red-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- No Filtered Results -->
        <div v-if="filteredBookings.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p class="text-slate-600">Nenhum agendamento encontrado com esse filtro</p>
        </div>
      </div>
    </template>
  </div>
</template>
