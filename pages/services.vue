<script setup lang="ts">
import type { Service } from '@/composables/useBooking'

const services: Service[] = [
  {
    id: 1,
    name: 'Corte de Cabelo',
    duration: 60,
    price: 80,
    description: 'Corte personalizado com acabamento profissional'
  },
  {
    id: 2,
    name: 'Escova + Finalização',
    duration: 90,
    price: 120,
    description: 'Escova modeladora com finalização impecável'
  },
  {
    id: 3,
    name: 'Coloração Raiz',
    duration: 120,
    price: 150,
    description: 'Retoque de raiz com produtos de alta qualidade'
  },
  {
    id: 4,
    name: 'Make Completa',
    duration: 60,
    price: 100,
    description: 'Maquiagem completa para qualquer ocasião'
  },
  {
    id: 5,
    name: 'Hidratação Profunda',
    duration: 90,
    price: 90,
    description: 'Tratamento intensivo para recuperação capilar'
  }
]

const { booking, selectService } = useBooking()
const router = useRouter()

// Normaliza id numérico se estado antigo estiver com string
if (booking?.value?.service && typeof booking.value.service.id === 'string') {
  booking.value.service.id = Number(booking.value.service.id)
}

const handleSelect = (service: Service) => {
  selectService(service)
  router.push('/schedule/date')
}

const selectedServiceId = computed(() => booking?.value?.service?.id)
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-blush-700">Serviços</p>
        <h1 class="text-2xl font-semibold">Lista de serviços</h1>
      </div>
      <NuxtLink to="/admin/services" class="text-sm muted">Ir para painel</NuxtLink>
    </div>

    <div class="rounded-lg border border-slate-200 bg-white p-4">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="text-slate-600">
            <th class="py-2">Nome</th>
            <th class="py-2">Duração</th>
            <th class="py-2">Preço</th>
            <th class="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id" class="border-t">
            <td class="py-3">{{ service.name }}</td>
            <td class="py-3">{{ service.duration }} min</td>
            <td class="py-3">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price) }}</td>
            <td class="py-3">
              <div class="flex gap-2">
                <button @click="handleSelect(service)" class="px-3 py-1 rounded bg-ink text-white text-xs">Agendar</button>
                <button class="px-3 py-1 rounded border text-xs">Editar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
