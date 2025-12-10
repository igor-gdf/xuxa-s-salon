<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

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

const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)

const { data: allBookings, refresh } = await useFetch<Booking[]>('/api/bookings', {
  headers: {
    Authorization: `Bearer ${useCookie('auth_token').value}`
  }
})

const monthYear = computed(() => {
  return currentDate.value.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  const firstDayOfWeek = firstDay.getDay()
  
  // Adicionar dias do mês anterior
  for (let i = firstDayOfWeek; i > 0; i--) {
    const date = new Date(year, month, 1 - i)
    days.push({ date, isCurrentMonth: false })
  }
  
  // Adicionar dias do mês atual
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({ date, isCurrentMonth: true })
  }
  
  // Adicionar dias do próximo mês para completar a grade
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({ date, isCurrentMonth: false })
  }
  
  return days
})

const getBookingsForDate = (date: Date) => {
  if (!allBookings.value) return []
  
  return allBookings.value.filter(booking => {
    const bookingDate = new Date(booking.date)
    return (
      bookingDate.getDate() === date.getDate() &&
      bookingDate.getMonth() === date.getMonth() &&
      bookingDate.getFullYear() === date.getFullYear()
    )
  })
}

const selectedDateBookings = computed(() => {
  if (!selectedDate.value) return []
  return getBookingsForDate(selectedDate.value).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
})

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1
  )
}

const selectDate = (date: Date) => {
  selectedDate.value = date
}

const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('pt-BR', { 
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
  <div class="min-h-screen bg-gradient-to-br from-blush-50 via-white to-blush-100 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-ink mb-2">Calendário de Agendamentos</h1>
          <p class="text-slate-600">Visualize e gerencie todos os agendamentos</p>
        </div>
        <NuxtLink 
          to="/admin"
          class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
        >
          ← Voltar
        </NuxtLink>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Calendar -->
        <div class="lg:col-span-2 rounded-2xl border border-white/70 bg-white p-6 shadow-lg">
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-6">
            <button
              @click="previousMonth"
              class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
            >
              ←
            </button>
            <h2 class="text-2xl font-bold text-ink capitalize">{{ monthYear }}</h2>
            <button
              @click="nextMonth"
              class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
            >
              →
            </button>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-2">
            <!-- Day Headers -->
            <div v-for="day in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']" 
                 :key="day"
                 class="text-center text-sm font-semibold text-slate-600 py-2">
              {{ day }}
            </div>

            <!-- Calendar Days -->
            <button
              v-for="({ date, isCurrentMonth }, index) in daysInMonth"
              :key="index"
              @click="selectDate(date)"
              class="aspect-square p-2 rounded-lg transition relative"
              :class="[
                isCurrentMonth ? 'text-ink' : 'text-slate-400',
                isToday(date) ? 'bg-blush-100 border-2 border-blush-400 font-bold' : '',
                selectedDate && selectedDate.toDateString() === date.toDateString() 
                  ? 'ring-2 ring-blush-500 bg-blush-50' 
                  : 'hover:bg-slate-100'
              ]"
            >
              <span class="text-sm">{{ date.getDate() }}</span>
              <div v-if="getBookingsForDate(date).length > 0" 
                   class="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                <div 
                  v-for="i in Math.min(getBookingsForDate(date).length, 3)" 
                  :key="i"
                  class="w-1.5 h-1.5 rounded-full bg-blush-500"
                />
              </div>
            </button>
          </div>
        </div>

        <!-- Bookings List for Selected Date -->
        <div class="rounded-2xl border border-white/70 bg-white p-6 shadow-lg">
          <h3 class="text-xl font-bold text-ink mb-4">
            {{ selectedDate 
              ? selectedDate.toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long' 
                }) 
              : 'Selecione uma data' 
            }}
          </h3>

          <div v-if="selectedDate && selectedDateBookings.length > 0" class="space-y-3 max-h-[600px] overflow-y-auto">
            <div
              v-for="booking in selectedDateBookings"
              :key="booking.id"
              class="p-4 rounded-xl border bg-slate-50"
            >
              <div class="flex items-start justify-between mb-2">
                <span class="font-bold text-ink text-lg">{{ formatTime(booking.date) }}</span>
                <span 
                  class="px-2 py-1 rounded-full text-xs font-semibold border"
                  :class="getStatusColor(booking.status)"
                >
                  {{ getStatusLabel(booking.status) }}
                </span>
              </div>

              <div class="space-y-1 mb-3">
                <p class="font-semibold text-blush-700">{{ booking.service.name }}</p>
                <p class="text-sm text-slate-600">{{ booking.user.name }}</p>
                <p class="text-xs text-slate-500">{{ booking.user.phone }}</p>
                <p class="text-sm font-semibold text-ink">{{ formatPrice(booking.service.price) }}</p>
              </div>

              <!-- Status Actions -->
              <div class="flex gap-2 mt-3">
                <button
                  v-if="booking.status === 'pending'"
                  @click="updateBookingStatus(booking.id, 'confirmed')"
                  class="flex-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition"
                >
                  Confirmar
                </button>
                <button
                  v-if="booking.status === 'confirmed'"
                  @click="updateBookingStatus(booking.id, 'completed')"
                  class="flex-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition"
                >
                  Concluir
                </button>
                <button
                  v-if="booking.status === 'completed'"
                  @click="updateBookingStatus(booking.id, 'pending')"
                  class="flex-1 px-3 py-1.5 rounded-lg bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 transition"
                  title="Voltar para pendente para corrigir erros"
                >
                  ↶ Pendente
                </button>
                <button
                  v-if="booking.status !== 'cancelled' && booking.status !== 'completed'"
                  @click="updateBookingStatus(booking.id, 'cancelled')"
                  class="flex-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                >
                  Cancelar
                </button>
              </div>

              <p v-if="booking.notes" class="text-xs text-slate-600 mt-2 italic">
                Obs: {{ booking.notes }}
              </p>
            </div>
          </div>

          <div v-else-if="selectedDate" class="text-center py-12">
            <p class="text-slate-500">Nenhum agendamento nesta data</p>
          </div>

          <div v-else class="text-center py-12">
            <p class="text-slate-500">Clique em uma data no calendário</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
