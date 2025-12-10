<script setup lang="ts">
import type { Service } from '@/composables/useBooking'

const { booking, setCustomer, isReadyToConfirm, resetBooking } = useBooking()
const { user, isAuthenticated } = useAuth()
const router = useRouter()

watchEffect(() => {
  if (!booking?.value?.service) {
    router.push('/services')
  } else if (!booking?.value?.date) {
    router.push('/schedule/date')
  } else if (!booking?.value?.time) {
    router.push('/schedule/time')
  }
})

// Se está logado, preencher automaticamente
const name = ref(user.value?.name || booking?.value?.customer?.name || '')
const phone = ref(user.value?.phone || booking?.value?.customer?.phone || '')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref('')

// Atualizar quando o usuário carregar
watch(user, (newUser) => {
  if (newUser) {
    name.value = newUser.name
    phone.value = newUser.phone
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
const selectedDate = computed(() => booking?.value?.date || null)
const selectedTime = computed(() => booking?.value?.time || null)

const handleSubmit = async () => {
  // Se não está logado, redirecionar para login
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  setCustomer(name.value, phone.value)
  
  if (!booking?.value?.service || !booking?.value?.date || !booking?.value?.time) {
    errorMessage.value = 'Por favor, complete todas as etapas do agendamento.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // Criar agendamento (agora usa o usuário logado automaticamente)
    const [year, month, day] = booking.value.date.split('-').map(Number)
    const [hours, minutes] = booking.value.time.split(':').map(Number)
    const bookingDate = new Date(year, month - 1, day, hours, minutes, 0, 0)

    const token = useCookie('auth_token').value

    console.log('Enviando agendamento:', {
      serviceId: booking.value.service!.id,
      date: bookingDate.toISOString(),
      hasToken: !!token
    })

    const response = await $fetch('/api/bookings', {
      method: 'POST',
      body: {
        serviceId: booking.value.service!.id,
        date: bookingDate.toISOString()
      },
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    console.log('Agendamento criado:', response)

    isSubmitted.value = true
    
    // Resetar após 3 segundos e redirecionar
    setTimeout(() => {
      resetBooking()
      router.push('/')
    }, 3000)
  } catch (error: any) {
    console.error('Erro ao criar agendamento:', error)
    errorMessage.value = error.data?.message || error.message || 'Erro ao confirmar agendamento. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-ink">Confirmar agendamento</h1>
      <p class="text-slate-600">Revise os dados e finalize seu agendamento</p>
    </div>

    <!-- Summary Card -->
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-6">
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <span class="text-sm text-slate-600">Serviço</span>
          <span class="font-semibold text-ink">{{ selectedService?.name }}</span>
        </div>
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <span class="text-sm text-slate-600">Data</span>
          <span class="font-semibold text-ink">{{ formatDate }}</span>
        </div>
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <span class="text-sm text-slate-600">Horário</span>
          <span class="font-semibold text-ink">{{ selectedTime }}</span>
        </div>
        <div class="flex items-center justify-between pt-3">
          <span class="text-sm text-slate-600">Duração</span>
          <span class="font-semibold text-ink">{{ selectedService?.duration }} min</span>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Auth Notice -->
      <div v-if="isAuthenticated" class="rounded-lg border border-green-200 bg-green-50 p-4">
        <p class="text-xs font-semibold text-green-800">✓ Logado como {{ user?.name }}</p>
      </div>

      <!-- Name Field -->
      <div class="space-y-2">
        <label class="text-sm font-semibold text-ink" for="name">Nome completo</label>
        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="João Silva"
          class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-ink focus:border-blush-300 focus:outline-none focus:ring-2 focus:ring-blush-300 disabled:bg-slate-100"
          required
          :disabled="isSubmitting || isSubmitted || isAuthenticated"
        />
      </div>

      <!-- Phone Field -->
      <div class="space-y-2">
        <label class="text-sm font-semibold text-ink" for="phone">Telefone</label>
        <input
          id="phone"
          v-model="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-ink focus:border-blush-300 focus:outline-none focus:ring-2 focus:ring-blush-300 disabled:bg-slate-100"
          required
          :disabled="isSubmitting || isSubmitted || isAuthenticated"
        />
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full btn-primary"
        :disabled="isSubmitting || isSubmitted"
      >
        <span v-if="isSubmitting">Confirmando...</span>
        <span v-else-if="isSubmitted">✓ Agendamento confirmado!</span>
        <span v-else>Confirmar agendamento</span>
      </button>

      <!-- Error Message -->
      <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div v-if="isSubmitted" class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Seu agendamento foi confirmado com sucesso! Redirecionando...
      </div>
    </form>
  </div>
</template>
