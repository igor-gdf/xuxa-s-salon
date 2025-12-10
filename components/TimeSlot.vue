<script setup lang="ts">
const props = defineProps<{
  label: string
  selected?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ (e: 'select', label: string): void }>()
</script>

<template>
  <button
    type="button"
    class="w-full rounded-xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-ink shadow-sm shadow-ink/5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 disabled:cursor-not-allowed disabled:opacity-50"
    :class="{ 'ring-2 ring-blush-400 border-blush-300 bg-white': selected }"
    :disabled="disabled"
    @click="emit('select', props.label)"
  >
    {{ label }}
  </button>
</template>
