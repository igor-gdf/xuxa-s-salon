<script setup lang="ts">
import type { Service } from '@/composables/useBooking'

const { booking, selectTime } = useBooking()
const router = useRouter()

// Redirecionar se não tiver serviço ou data selecionados
watchEffect(() => {
  if (!booking?.value?.service) {
    router.push('/services')
  } else if (!booking?.value?.date) {
    router.push('/schedule/date')
  }
})

const formatDate = computed(() => {
  if (!booking?.value?.date) return ''
  const [year, month, day] = booking.value.date!.split('-').map(Number)
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1)
  return parsed.toLocaleDateString('pt-BR', {
    weekday: 'long',
    month: 'long',
    day: '2-digit'
  })
})

// Computed seguros para SSR
const selectedService = computed(() => booking?.value?.service as Service | null)
const selectedTime = computed(() => booking?.value?.time || null)

// Buscar horários disponíveis da API apenas se tiver serviço e data
const shouldFetch = computed(() => !!(booking?.value?.date && booking?.value?.service))

const { data: availableSlotsData, pending, error } = await useFetch(() => {
  if (!shouldFetch.value) return null
  const serviceId = Number(booking?.value?.service?.id ?? 0)
  return `/api/bookings/available?date=${booking?.value?.date}&serviceId=${serviceId}`
}, {
  watch: [shouldFetch]
})

const slots = computed(() => {
  if (!availableSlotsData.value?.availableSlots) return []
  return availableSlotsData.value.availableSlots.map((slot: string) => {
    const date = new Date(slot)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  })
})

const handleSelect = (time: string) => {
  selectTime(time)
  router.push('/schedule/confirm')
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-ink">Escolha o horário</h1>
      <p class="text-slate-600">Selecione um horário disponível</p>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border bg-white p-4">
      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <p class="text-xs text-slate-600">Serviço</p>
          <p class="font-semibold text-ink">{{ selectedService?.name }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-600">Data</p>
          <p class="font-semibold text-ink">{{ formatDate }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-600">Duração</p>
          <p class="font-semibold text-ink">{{ selectedService?.duration }} min</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-10">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-ink border-r-transparent"></div>
      <p class="mt-2 text-slate-600">Carregando horários disponíveis...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      Erro ao carregar horários. Tente novamente mais tarde.
    </div>

    <!-- Empty -->
    <div v-else-if="slots.length === 0" class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
      <p class="font-semibold">Sem horários disponíveis</p>
      <p class="text-sm">Nenhum horário disponível para essa data. Escolha outra data.</p>
    </div>

    <!-- Time Slots -->
    <div v-else class="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
      <div v-for="slot in slots" :key="slot">
        <button @click="handleSelect(slot)" :class="['w-full rounded-lg p-3 text-center', selectedTime === slot ? 'bg-ink text-white' : 'bg-white border']">{{ slot }}</button>
      </div>
    </div>
  </div>
</template>
