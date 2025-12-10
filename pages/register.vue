<script setup lang="ts">
definePageMeta({
  layout: false
})

const { register } = useAuth()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'As senhas não coincidem'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'A senha deve ter no mínimo 6 caracteres'
    return
  }

  loading.value = true

  const { confirmPassword, ...data } = form.value
  const result = await register(data)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Erro ao criar conta'
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-screen flex bg-slate-50">
    <!-- Left Side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blush-600 to-blush-800 p-12 flex-col justify-between">
      <div>
        <h1 class="text-4xl font-bold text-white mb-2">Xuxa's Salon</h1>
        <p class="text-blush-100 text-lg">Beleza e bem-estar em um só lugar</p>
      </div>
      <div class="space-y-6 text-white/90">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Cadastro Rápido</h3>
            <p class="text-sm text-blush-100">Crie sua conta em poucos passos</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Dados Seguros</h3>
            <p class="text-sm text-blush-100">Suas informações protegidas</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Acesso Imediato</h3>
            <p class="text-sm text-blush-100">Comece a agendar agora mesmo</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Register Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="w-full max-w-md">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">Criar sua conta</h2>
          <p class="text-slate-600">Preencha os dados abaixo para começar</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="name">Nome Completo</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Maria Silva"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blush-500 focus:ring-2 focus:ring-blush-200 focus:outline-none transition"
                required
                :disabled="loading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="email">Email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="seu@email.com"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blush-500 focus:ring-2 focus:ring-blush-200 focus:outline-none transition"
                required
                :disabled="loading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="phone">Telefone</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="(11) 99999-9999"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blush-500 focus:ring-2 focus:ring-blush-200 focus:outline-none transition"
                required
                :disabled="loading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="password">Senha</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blush-500 focus:ring-2 focus:ring-blush-200 focus:outline-none transition"
                required
                :disabled="loading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="confirmPassword">Confirmar Senha</label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blush-500 focus:ring-2 focus:ring-blush-200 focus:outline-none transition"
                required
                :disabled="loading"
              />
            </div>

            <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {{ error }}
            </div>

            <button
              type="submit"
              class="w-full bg-blush-600 hover:bg-blush-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            >
              {{ loading ? 'Criando conta...' : 'Criar conta' }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-slate-600">
              Já tem uma conta?
              <NuxtLink to="/login" class="font-semibold text-blush-600 hover:text-blush-700">
                Fazer login
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
