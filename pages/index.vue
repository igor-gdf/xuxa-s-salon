<script setup lang="ts">
import Card from '@/components/Card.vue'
const { user, isAuthenticated, isAdmin } = useAuth()
</script>

<template>
  <section class="space-y-6">
    <!-- Top row: title + contextual subtitle -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Home</h1>
        <div class="muted text-sm">Portal de entrada — acesso rápido para usuários e administradores</div>
      </div>
      <div class="text-sm muted">Bem-vindo{{ isAuthenticated ? `, ${user?.name || ''}` : '' }}</div>
    </div>

    <!-- Quick actions (visíveis para todos) -->
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <Card>
        <div class="card-title">Agendar</div>
        <p class="muted text-sm mt-2">Escolha serviço, data e horário</p>
        <div class="mt-4">
          <NuxtLink to="/schedule/date" class="inline-flex items-center gap-2 rounded px-3 py-2 bg-ink text-white text-sm">Agendar</NuxtLink>
        </div>
      </Card>

      <Card>
        <div class="card-title">Serviços</div>
        <p class="muted text-sm mt-2">Ver lista de serviços disponíveis</p>
        <div class="mt-4">
          <NuxtLink to="/services" class="inline-flex items-center gap-2 rounded px-3 py-2 border border-slate-200 text-sm">Ver serviços</NuxtLink>
        </div>
      </Card>

      <Card>
        <div class="card-title">Meus Agendamentos</div>
        <p class="muted text-sm mt-2">Consultar e gerenciar seus agendamentos</p>
        <div class="mt-4">
          <NuxtLink to="/my-bookings" class="inline-flex items-center gap-2 rounded px-3 py-2 border border-slate-200 text-sm">Meus agendamentos</NuxtLink>
        </div>
      </Card>
    </div>

    <!-- User-specific / Admin links -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <div class="card-title">Informações Rápidas</div>
        <div class="muted text-sm mt-2">Acesso rápido às ações mais comuns</div>
        <ul class="mt-3 space-y-2 text-sm">
          <li>
            <NuxtLink to="/services" class="text-sm">• Ver serviços</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/schedule/date" class="text-sm">• Novo agendamento</NuxtLink>
          </li>
          <li v-if="isAuthenticated">
            <NuxtLink to="/my-bookings" class="text-sm">• Meus agendamentos</NuxtLink>
          </li>
        </ul>
      </Card>

      <Card v-if="isAdmin">
        <div class="card-title">Administração</div>
        <p class="muted text-sm mt-2">Links rápidos para administração</p>
        <ul class="mt-3 space-y-2 text-sm">
          <li><NuxtLink to="/admin" class="text-sm">• Painel</NuxtLink></li>
          <li><NuxtLink to="/admin/services" class="text-sm">• Gerenciar serviços</NuxtLink></li>
          <li><NuxtLink to="/admin/schedule" class="text-sm">• Gerenciar horários</NuxtLink></li>
        </ul>
      </Card>
    </div>
  </section>
</template>
