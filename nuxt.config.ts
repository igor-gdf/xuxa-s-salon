import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['@/assets/css/tailwind.css'],
  app: {
    head: {
      title: "Xuxa's Salon",
      meta: [
        { name: 'description', content: 'Agendamentos rápidos e fáceis para o salão.' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap'
        }
      ]
    }
  }
})
