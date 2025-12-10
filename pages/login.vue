<script setup lang="ts">
definePageMeta({
  layout: false
})

const { login } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  const result = await login(email.value, password.value)

  if (result.success) {
    if (result.user?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } else {
    error.value = result.error || 'Erro ao fazer login'
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Agendamento Online</h3>
            <p class="text-sm text-blush-100">Reserve seu horário com facilidade</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Gestão de Horários</h3>
            <p class="text-sm text-blush-100">Acompanhe seus agendamentos em tempo real</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Profissionais Qualificados</h3>
            <p class="text-sm text-blush-100">Equipe experiente e dedicada</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="w-full max-w-md">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">Bem-vindo de volta</h2>
          <p class="text-slate-600">Entre com suas credenciais para continuar</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="email">Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blush-500 focus:ring-2 focus:ring-blush-200 focus:outline-none transition"
                required
                :disabled="loading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2" for="password">Senha</label>
              <input
                id="password"
                v-model="password"
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
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-slate-600">
              Não tem uma conta?
              <NuxtLink to="/register" class="font-semibold text-blush-600 hover:text-blush-700">
                Criar conta
              </NuxtLink>
            </p>
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <p class="font-semibold mb-2">Credenciais de teste:</p>
          <div class="space-y-1">
            <p><strong>Admin:</strong> admin@xuxa.salon / admin123</p>
            <p><strong>Cliente:</strong> cliente@teste.com / cliente123</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
