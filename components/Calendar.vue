<script setup lang="ts">
type DateItem = {
  value: string
  labelDay: string
  labelMonth: string
  dayNumber: number
}

const props = defineProps<{
  availableDates: string[]
  selectedDate?: string | null
}>()

const emit = defineEmits<{ (e: 'select', date: string): void }>()

const normalizeDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

const dates = computed<DateItem[]>(() =>
  props.availableDates
    .map((value) => {
      const parsed = normalizeDate(value)
      return {
        value,
        labelDay: parsed.toLocaleDateString('pt-BR', { weekday: 'short' }),
        labelMonth: parsed.toLocaleDateString('pt-BR', { month: 'short' }),
        dayNumber: parsed.getDate()
      }
    })
    .filter((item) => !Number.isNaN(item.dayNumber))
)
</script>

<template>
  <div>
    <div v-if="!dates.length" class="text-sm text-slate-500">Nenhuma data disponível.</div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <button
        v-for="date in dates"
        :key="date.value"
        type="button"
        class="rounded-2xl border border-white/60 bg-white/70 p-4 text-left shadow-sm shadow-ink/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
        :class="{ 'ring-2 ring-blush-400 border-blush-200': selectedDate === date.value }"
        :aria-pressed="selectedDate === date.value"
        @click="emit('select', date.value)"
      >
        <div class="text-sm uppercase tracking-wide text-slate-500">{{ date.labelMonth }}</div>
        <div class="mt-1 text-3xl font-semibold text-ink">{{ date.dayNumber }}</div>
        <div class="mt-1 text-sm text-blush-700">{{ date.labelDay }}</div>
      </button>
    </div>
  </div>
</template>
