import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['\"Space Grotesk\"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        blush: {
          50: '#fff8f5',
          100: '#ffe9e0',
          200: '#ffcbb8',
          300: '#ffa083',
          400: '#ff7a52',
          500: '#ff5c2c',
          600: '#f0461c',
          700: '#c23319',
          800: '#9a2c1e',
          900: '#7c271f'
        },
        ink: '#0f172a'
      }
    }
  }
}
