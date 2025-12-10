<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

const { isAdmin } = useAuth()

interface Service {
  id: number
  name: string
  description: string
  duration: number
  price: number
  active: boolean
}

const { data: services, refresh } = await useFetch<Service[]>('/api/services', {
  headers: {
    Authorization: `Bearer ${useCookie('auth_token').value}`
  }
})

const isModalOpen = ref(false)
const editingService = ref<Service | null>(null)
const isSubmitting = ref(false)

const formData = ref({
  name: '',
  description: '',
  duration: 60,
  price: 0,
  active: true
})

const openModal = (service?: Service) => {
  if (service) {
    editingService.value = service
    formData.value = {
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      active: service.active
    }
  } else {
    editingService.value = null
    formData.value = {
      name: '',
      description: '',
      duration: 60,
      price: 0,
      active: true
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingService.value = null
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const token = useCookie('auth_token').value
    const url = editingService.value 
      ? `/api/services/${editingService.value.id}`
      : '/api/services'
    
    await $fetch(url, {
      method: editingService.value ? 'PUT' : 'POST',
      body: formData.value,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    await refresh()
    closeModal()
  } catch (error: any) {
    alert(error.data?.message || 'Erro ao salvar serviço')
  } finally {
    isSubmitting.value = false
  }
}

const deleteService = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir este serviço?')) return

  try {
    await $fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${useCookie('auth_token').value}`
      }
    })
    await refresh()
  } catch (error: any) {
    alert(error.data?.message || 'Erro ao excluir serviço')
  }
}

const toggleActive = async (service: Service) => {
  try {
    await $fetch(`/api/services/${service.id}`, {
      method: 'PUT',
      body: { ...service, active: !service.active },
      headers: {
        Authorization: `Bearer ${useCookie('auth_token').value}`
      }
    })
    await refresh()
  } catch (error: any) {
    alert(error.data?.message || 'Erro ao atualizar serviço')
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(price)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blush-50 via-white to-blush-100 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-ink mb-2">Gerenciar Serviços</h1>
          <p class="text-slate-600">Adicione, edite ou remova serviços do salão</p>
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
            + Novo Serviço
          </button>
        </div>
      </div>

      <!-- Services Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="service in services"
          :key="service.id"
          class="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-lg"
          :class="service.active ? 'border-white/70' : 'border-red-200 bg-red-50/30'"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-bold text-ink mb-1">{{ service.name }}</h3>
              <p class="text-sm text-slate-600">{{ service.description }}</p>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-semibold"
              :class="service.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ service.active ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-slate-600">Duração:</span>
              <span class="font-semibold text-ink">{{ service.duration }} min</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-600">Preço:</span>
              <span class="font-bold text-blush-700">{{ formatPrice(service.price) }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="openModal(service)"
              class="flex-1 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition"
            >
              Editar
            </button>
            <button
              @click="toggleActive(service)"
              class="flex-1 px-4 py-2 rounded-lg font-medium transition"
              :class="service.active 
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                : 'bg-green-50 text-green-700 hover:bg-green-100'"
            >
              {{ service.active ? 'Desativar' : 'Ativar' }}
            </button>
            <button
              @click="deleteService(service.id)"
              class="px-4 py-2 rounded-lg bg-red-50 text-red-700 font-medium hover:bg-red-100 transition"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!services || services.length === 0" class="text-center py-16">
        <p class="text-slate-500 text-lg mb-4">Nenhum serviço cadastrado ainda</p>
        <button
          @click="openModal()"
          class="px-6 py-3 rounded-xl bg-blush-600 text-white font-semibold hover:bg-blush-700 transition"
        >
          Criar Primeiro Serviço
        </button>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="closeModal"
      >
        <div class="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
          <h2 class="text-2xl font-bold text-ink mb-6">
            {{ editingService ? 'Editar Serviço' : 'Novo Serviço' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-ink mb-2">Nome do Serviço</label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 outline-none transition"
                placeholder="Ex: Corte de Cabelo"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-ink mb-2">Descrição</label>
              <textarea
                v-model="formData.description"
                required
                rows="3"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 outline-none transition resize-none"
                placeholder="Descreva o serviço..."
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-ink mb-2">Duração (minutos)</label>
                <input
                  v-model.number="formData.duration"
                  type="number"
                  min="15"
                  step="15"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 outline-none transition"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-ink mb-2">Preço (R$)</label>
                <input
                  v-model.number="formData.price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 outline-none transition"
                />
              </div>
            </div>

            <div class="flex items-center gap-3">
              <input
                v-model="formData.active"
                type="checkbox"
                id="active"
                class="w-5 h-5 rounded border-slate-300 text-blush-600 focus:ring-2 focus:ring-blush-200"
              />
              <label for="active" class="text-sm font-medium text-ink">Serviço ativo</label>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                :disabled="isSubmitting"
                class="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 px-6 py-3 rounded-xl bg-blush-600 text-white font-semibold hover:bg-blush-700 transition disabled:opacity-50"
              >
                {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
