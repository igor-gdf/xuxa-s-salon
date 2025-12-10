<script setup lang="ts">
import type { Service } from '@/composables/useBooking'

const props = defineProps<{
  service: Service
  selected?: boolean
}>()

const emit = defineEmits<{ (e: 'select', service: Service): void }>()

const formattedPrice = computed(() =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(props.service.price)
)
</script>

<template>
  <button
    class="w-full text-left p-5 transition shadow-sm bg-white border rounded-2xl btn-outline hover:shadow-md"
    :class="{ 'ring-2 ring-blush-400 border-blush-300': selected }"
    type="button"
    @click="emit('select', service)"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-ink">{{ service.name }}</h3>
        <p class="mt-1 text-sm text-slate-600">{{ service.description }}</p>
      </div>
      <div class="flex flex-col items-end text-right">
        <span class="text-base font-bold text-ink">{{ formattedPrice }}</span>
        <span class="text-xs text-slate-500">{{ service.duration }} min</span>
      </div>
    </div>
    <div class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blush-700">
      <span class="rounded px-3 py-1 border border-slate-100 text-xs">Selecionar</span>
    </div>
  </button>
</template>
