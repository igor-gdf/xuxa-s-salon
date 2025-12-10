<script setup lang="ts">
import type { Service } from '@/composables/useBooking'

const { booking, selectDate } = useBooking()
const router = useRouter()

const formatLocalISO = (date: Date) => date.toLocaleDateString('en-CA')

const availableDates = computed(() => {
  const today = new Date()
  return Array.from({ length: 10 }, (_, index) => {
    const day = new Date(today)
    day.setDate(today.getDate() + index)
    return formatLocalISO(day)
  })
})

const handleSelect = (date: string) => {
  selectDate(date)
  router.push('/schedule/time')
}

const selectedService = computed(() => booking?.value?.service as Service | null)
const selectedDate = computed(() => booking?.value?.date || null)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <p class="text-sm font-semibold uppercase tracking-wide text-blush-700">Passo 2</p>
        <h1 class="text-3xl font-semibold text-ink">Escolha a data</h1>
        <p class="text-slate-600">Selecione o dia que funciona melhor para você.</p>
      </div>
      <div v-if="selectedService" class="rounded-lg p-3 bg-white border">
        <div class="text-sm text-slate-600">Serviço selecionado</div>
        <div class="font-semibold text-ink">{{ selectedService.name }}</div>
        <div class="muted text-sm">{{ selectedService.duration }} min</div>
      </div>
      <NuxtLink v-else to="/services" class="btn-outline">Escolher serviço</NuxtLink>
    </div>
    <Calendar :available-dates="availableDates" :selected-date="selectedDate" @select="handleSelect" />
  </section>
</template>
