<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

interface TimeSlot {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  active: boolean
}

const { data: slots, refresh } = await useFetch<TimeSlot[]>('/api/schedule/slots', {
  headers: {
    Authorization: `Bearer ${useCookie('auth_token').value}`
  }
})

const daysOfWeek = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
]

const selectedDay = ref(1)
const isModalOpen = ref(false)
const editingSlot = ref<TimeSlot | null>(null)

const formData = ref({
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '10:00',
  active: true
})

const daySlots = computed(() => {
  return slots.value?.filter(s => s.dayOfWeek === selectedDay.value)
    .sort((a, b) => a.startTime.localeCompare(b.startTime)) || []
})

const openModal = (slot?: TimeSlot) => {
  if (slot) {
    editingSlot.value = slot
    formData.value = {
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      active: slot.active
    }
  } else {
    editingSlot.value = null
    formData.value = {
      dayOfWeek: selectedDay.value,
      startTime: '09:00',
      endTime: '10:00',
      active: true
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingSlot.value = null
}

const handleSubmit = async () => {
  try {
    const token = useCookie('auth_token').value
    const url = editingSlot.value 
      ? `/api/schedule/slots/${editingSlot.value.id}`
      : '/api/schedule/slots'
    
    await $fetch(url, {
      method: editingSlot.value ? 'PUT' : 'POST',
      body: formData.value,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    await refresh()
    closeModal()
  } catch (error: any) {
    alert(error.data?.message || 'Erro ao salvar horário')
  }
}

const deleteSlot = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir este horário?')) return

  try {
    await $fetch(`/api/schedule/slots/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${useCookie('auth_token').value}`
      }
    })
    await refresh()
  } catch (error: any) {
    alert(error.data?.message || 'Erro ao excluir horário')
  }
}

const toggleSlot = async (slot: TimeSlot) => {
  try {
    await $fetch(`/api/schedule/slots/${slot.id}`, {
      method: 'PUT',
      body: { ...slot, active: !slot.active },
      headers: {
        Authorization: `Bearer ${useCookie('auth_token').value}`
      }
    })
    await refresh()
  } catch (error: any) {
    alert(error.data?.message || 'Erro ao atualizar horário')
  }
}

const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push(time)
    }
  }
  return options
}

const timeOptions = generateTimeOptions()

const getDayLabel = (day: number) => {
  return daysOfWeek.find(d => d.value === day)?.label || ''
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blush-50 via-white to-blush-100 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-ink mb-2">Gerenciar Horários</h1>
          <p class="text-slate-600">Configure os horários disponíveis para agendamento</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink 
            to="/admin"
            class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            ← Voltar
          </NuxtLink>
          <button
            @click="openModal()"
            class="px-6 py-2 rounded-xl bg-blush-600 text-white font-semibold hover:bg-blush-700 transition shadow-md"
          >
            + Novo Horário
          </button>
        </div>
      </div>

      <!-- Day Selector -->
      <div class="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="day in daysOfWeek"
          :key="day.value"
          @click="selectedDay = day.value"
          class="px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition"
          :class="selectedDay === day.value 
            ? 'bg-blush-600 text-white shadow-md' 
            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'"
        >
          {{ day.label }}
        </button>
      </div>

      <!-- Time Slots Grid -->
      <div class="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg">
        <h2 class="text-xl font-bold text-ink mb-4">
          {{ getDayLabel(selectedDay) }}
        </h2>

        <div v-if="daySlots.length > 0" class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="slot in daySlots"
            :key="slot.id"
            class="flex items-center justify-between p-4 rounded-xl border transition"
            :class="slot.active 
              ? 'border-slate-200 bg-white' 
              : 'border-red-200 bg-red-50'"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-3 h-3 rounded-full"
                :class="slot.active ? 'bg-green-500' : 'bg-red-500'"
              />
              <div>
                <p class="font-semibold text-ink">
                  {{ slot.startTime }} - {{ slot.endTime }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ slot.active ? 'Disponível' : 'Bloqueado' }}
                </p>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="openModal(slot)"
                class="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                title="Editar"
              >
                ✏️
              </button>
              <button
                @click="toggleSlot(slot)"
                class="p-2 rounded-lg transition"
                :class="slot.active 
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                  : 'bg-green-50 text-green-700 hover:bg-green-100'"
                :title="slot.active ? 'Bloquear' : 'Desbloquear'"
              >
                {{ slot.active ? '🔒' : '🔓' }}
              </button>
              <button
                @click="deleteSlot(slot.id)"
                class="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
                title="Excluir"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-slate-500 mb-4">Nenhum horário configurado para este dia</p>
          <button
            @click="openModal()"
            class="px-6 py-3 rounded-xl bg-blush-600 text-white font-semibold hover:bg-blush-700 transition"
          >
            Adicionar Horário
          </button>
        </div>
      </div>

      <!-- Quick Config Info -->
      <div class="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-6">
        <h3 class="font-semibold text-blue-900 mb-2">💡 Dica: Intervalos personalizados</h3>
        <p class="text-sm text-blue-700">
          Para ter horários com intervalos (ex: 9h-12h e 14h-18h), adicione múltiplos períodos para o mesmo dia. 
          Horários inativos não aparecerão para os clientes.
        </p>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="closeModal"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
          <h2 class="text-2xl font-bold text-ink mb-6">
            {{ editingSlot ? 'Editar Horário' : 'Novo Horário' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-ink mb-2">Dia da Semana</label>
              <select
                v-model.number="formData.dayOfWeek"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 outline-none transition"
              >
                <option v-for="day in daysOfWeek" :key="day.value" :value="day.value">
                  {{ day.label }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-ink mb-2">Horário Início</label>
                <select
                  v-model="formData.startTime"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 outline-none transition"
                >
                  <option v-for="time in timeOptions" :key="time" :value="time">
                    {{ time }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-ink mb-2">Horário Fim</label>
                <select
                  v-model="formData.endTime"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 outline-none transition"
                >
                  <option v-for="time in timeOptions" :key="time" :value="time">
                    {{ time }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <input
                v-model="formData.active"
                type="checkbox"
                id="slotActive"
                class="w-5 h-5 rounded border-slate-300 text-blush-600 focus:ring-2 focus:ring-blush-200"
              />
              <label for="slotActive" class="text-sm font-medium text-ink">Horário disponível</label>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 px-6 py-3 rounded-xl bg-blush-600 text-white font-semibold hover:bg-blush-700 transition"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
