# Resumo para Migração — Xuxa's Salon

Este arquivo reúne as telas, componentes, APIs e recomendações necessárias para migrar a aplicação para outro framework.

## Telas Principais
- **Home**: visão inicial com lista de serviços e CTAs. ([pages/index.vue](pages/index.vue))
- **Login**: autenticação (POST `/api/auth/login`). ([pages/login.vue](pages/login.vue))
- **Register**: cadastro de usuário (POST `/api/auth/register`). ([pages/register.vue](pages/register.vue))
- **Serviços (catálogo)**: listagem de serviços com cartões. ([pages/services.vue](pages/services.vue))
- **Meus Agendamentos**: lista e detalhes dos agendamentos do usuário. ([pages/my-bookings.vue](pages/my-bookings.vue))
- **Fluxo de Agendamento (multi-step)**:
  - Escolher data: [pages/schedule/date.vue](pages/schedule/date.vue)
  - Escolher horário: [pages/schedule/time.vue](pages/schedule/time.vue)
  - Confirmar: [pages/schedule/confirm.vue](pages/schedule/confirm.vue)
- **Área Admin**: painel administrativo para gerenciar serviços e calendário. ([pages/admin/](pages/admin/))

## Componentes Relevantes
- `ServiceCard.vue`: cartão de serviço com título, duração e preço. ([components/ServiceCard.vue](components/ServiceCard.vue))
- `Calendar.vue`: seletor de data / calendário. ([components/Calendar.vue](components/Calendar.vue))
- `TimeSlot.vue`: botão/slot de horário. ([components/TimeSlot.vue](components/TimeSlot.vue))
- `TopBar.vue`, `Sidebar.vue`: navegação e layout. ([components/TopBar.vue](components/TopBar.vue))

## Estado e Lógica Reutilizável
- `composables/useAuth.ts`: logic de autenticação, estado do usuário e token.
- `composables/useBooking.ts`: criação, listagem e verificação de disponibilidade de agendamentos.
- `middleware/`: guards de rota — `auth.global.ts`, `admin.ts`, `my-bookings.ts` (mapear para route-guards do novo framework).

## APIs / Backend
Endpoints em `server/api/`:
- `auth/`: `login.ts`, `register.ts`, `me.ts` (JWT).
- `services/`: `index.ts` (GET/POST), `[id].ts` (PUT/DELETE).
- `bookings/`: `index.ts` (GET/POST), `[id].ts` (GET/PUT), `available.ts` (GET horários disponíveis).

Utilitários: `server/utils/prisma.ts`, `server/utils/auth.ts`, `server/utils/jwt.ts`, `server/utils/password.ts`.

Regras de negócio principais:
- Horário de funcionamento: 08:00–18:00, intervalos de 1 hora.
- Apenas um agendamento por horário (slots únicos).
- Status de agendamento: `pending`, `confirmed`, `cancelled`, `completed`.

## Modelos de Dados
O schema em `prisma/schema.prisma` contém os modelos principais: `User`, `Service`, `Booking`, `AvailableSlot`. Manter ou migrar o schema conforme a nova stack.

## Fluxos de Usuário (resumido)
- Usuário vê home e serviços → faz cadastro/login → escolhe serviço → seleciona data → escolhe horário (verifica disponibilidade) → confirma agendamento → consulta em "Meus Agendamentos".
- Admin faz login → acessa painel → cria/edita/exclui serviços e gerencia o calendário.

## Checklist de Migração

## Arquivos úteis no repositório

# Plano de Recriação Completa em Next.js

Objetivo: descrever o que recriar do zero em Next.js (App Router), quais arquivos/fluxos implementar e como organizar o trabalho. Este arquivo foca exclusivamente em instruções claras e acionáveis para refazer toda a aplicação em Next.js — sem preservar código antigo.

Resumo rápido
- Prioridade imediata: rotas públicas e fluxo de agendamento (index, services, schedule/*, my-bookings, auth).
- Backend: reimplemente as APIs em Next.js API Routes ou mantenha um backend Node separado (recomendo migrar para `pages/api/` se quiser monorepo simples).
- Banco: mantenha Prisma (`prisma/`) e scripts; adapte `prisma client` para Next.js.

1) Estrutura inicial do projeto Next.js (App Router)

Recomendo criar o projeto com:

```bash
npx create-next-app@latest xuxas-salon --ts --app
cd xuxas-salon
npm install prisma @prisma/client bcrypt jsonwebtoken tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Estrutura sugerida (resumida):

```
app/
  layout.tsx
  page.tsx            # home
  login/page.tsx
  register/page.tsx
  services/page.tsx
  services/[id]/page.tsx
  schedule/
    date/page.tsx
    time/page.tsx
    confirm/page.tsx
  my-bookings/page.tsx
  admin/
    page.tsx
    services/page.tsx
    calendar/page.tsx
components/
  ServiceCard.tsx
  Calendar.tsx
  TimeSlot.tsx
  TopBar.tsx
  Sidebar.tsx
lib/
  prisma.ts
  auth.ts
hooks/
  useAuth.tsx
  useBooking.tsx
pages/api/   # API routes (opcional se preferir app router handlers)
prisma/
  schema.prisma
  seed.ts
public/
styles/
  globals.css
```

2) Mapeamento: o que recriar e por quê

- Páginas/Rotas: recrie todas as páginas listadas acima como React/TSX. Cada rota deve ter server/client boundaries claras: carregue dados críticos no server (server components) e use client components para interatividade.
- Componentes: reimplemente `ServiceCard`, `Calendar`, `TimeSlot`, `TopBar`, `Sidebar` como componentes React. Tenha foco em props, acessibilidade e estados locais.
- Hooks/Estado: implemente `useAuth` (context + cookie/JWT handling) e `useBooking` (funções para checar disponibilidade, criar booking). Use React Context para `AuthProvider`.
- API: recrie endpoints equivalentes em `pages/api/*` (ou `app/api/*` se optar por App Router API routes).
- Prisma: mantenha modelos em `prisma/schema.prisma`; gere client com `prisma generate`. Crie `lib/prisma.ts` para singleton.

3) CTAs (detalhado) — o que implementar e como

- `Agendar agora` (Primary CTA): botão em `ServiceCard` que chama `router.push(`/schedule/date?serviceId=${id}`)`. Implementar tracking via função `trackEvent('cta', 'book_now', { serviceId })`.
- `Ver detalhes` (Secondary CTA): link para `services/[id]`.
- `Entrar` / `Criar conta`: botão que abre rota `login` ou `register`. Após login, setar cookie `token` (`httpOnly`) e redirecionar para rota anterior.
- `Confirmar agendamento`: no `schedule/confirm`, chamar `fetch('/api/bookings', { method: 'POST', body })` e tratar estado de loading / sucesso / erro.

4) Exemplos mínimos (snippets)

- `lib/prisma.ts` (singleton):

```ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma
```

- `pages/api/auth/login.ts` (esqueleto):

```ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { sign } from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid' })
  const token = sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}`)
  res.json({ ok: true })
}
```

- Navegação client-side (App Router):

```ts
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push(`/schedule/date?serviceId=${serviceId}`)
```

5) Checklist de implementação por ordem recomendada

- Inicializar projeto Next.js + Tailwind + Prisma
- Criar `lib/prisma.ts` e rodar `prisma db push && prisma db seed`
- Implementar APIs essenciais: `auth`, `services`, `bookings/available`, `bookings` (POST)
- Implementar `useAuth` (login/logout, cookie handling)
- Implementar páginas críticas: `index`, `services`, `schedule/*`, `my-bookings`
- Converter componentes reutilizáveis e integrar CTAs
- Implementar área admin e rotas protegidas
- Testes manuais e cobertura básica (fluxo de agendamento completo)

6) Regras de negócio (garantir ao recriar)

- Horário de funcionamento: 08:00–18:00, intervalo de 1h.
- Somente 1 agendamento por slot: verificar disponibilidade antes de confirmar.
- Status de agendamento: manter `pending`, `confirmed`, `cancelled`, `completed`.

7) Testes e QA

- Teste end-to-end do fluxo principal: selecionar serviço → data → horário → confirmar → ver em `my-bookings`.
- Teste de segurança: tokens, cookies, proteção de rotas admin.

8) Deploy

- Recomendado: Vercel (suporte Next.js), variáveis de ambiente para `DATABASE_URL`, `JWT_SECRET`.

Com isso, `MIGRACAO_SUMARIO.md` agora descreve exatamente o que você deve refazer em Next.js e como proceder.

Próximo: quer que eu gere um scaffold de exemplo (componentes, API handlers e hooks) no repositório já convertido para Next.js? 

- **Primary CTA (Ex.: Agendar / Book Now)**
  - Objetivo: iniciar o fluxo de agendamento para um serviço específico.
  - Localização: nos cartões de serviço (`ServiceCard.vue`), na página de detalhes do serviço e no header quando o usuário estiver autenticado.
  - Texto/Label sugerido: `Agendar agora`, `Book Now` (PT-BR: `Agendar agora`).
  - Estilo: botão primário com destaque (cor `blush-500` no Tailwind). Deve ter `aria-label` descritivo.
  - Comportamento: ao clicar, navega para a rota de seleção de data `/schedule/date?serviceId=<id>` usando `next/link` ou `useRouter().push()` em Next.js. Deve disparar evento de analytics `cta_book_now` com `{ serviceId }`.

- **Secondary CTA (Ex.: Ver detalhes / Learn more)**
  - Objetivo: levar a página de detalhes do serviço sem iniciar o agendamento imediatamente.
  - Localização: dentro de `ServiceCard`, abaixo do resumo.
  - Texto: `Ver mais` / `Detalhes`.
  - Comportamento: navegação interna para `/services/[id]` (Next.js: rota dinâmica). Evento de analytics `cta_view_service`.

- **Auth CTA (Login / Register)**
  - Objetivo: abrir modal ou navegar para páginas de autenticação.
  - Localização: `TopBar` (desktop) e `Sidebar` (mobile).
  - Texto: `Entrar`, `Criar conta`.
  - Comportamento: ao concluir login, redirecionar para a rota anterior ou para `/my-bookings` e disparar `user_login`.

- **Agendamento CTA (Confirmar agendamento)**
  - Objetivo: finalizar o fluxo multi-step.
  - Localização: [pages/schedule/confirm.vue](pages/schedule/confirm.vue).
  - Texto: `Confirmar agendamento`.
  - Comportamento: chama POST `/api/bookings` com payload `{ userId, serviceId, datetime }`. Em Next.js, use fetch para `/api/bookings` ou cliente dedicado; ao sucesso, navegar para `/my-bookings` e exibir notificação.

- **Admin CTA (Criar/Salvar serviço)**
  - Objetivo: criar/editar serviços no painel admin.
  - Localização: [pages/admin/services.vue](pages/admin/services.vue).
  - Validations: exibir erros inline; desabilitar botão enquanto o request estiver em andamento.

Boas práticas para todos os CTAs:
- Fornecer `aria-label` e `role="button"` quando aplicável.
- Usar estados visuais: hover, focus-visible, disabled.
- Evitar textos genéricos: use verbos claros (`Agendar`, `Confirmar`).
- Emitir eventos de analytics com categoria `cta`, ação e labels relevantes.
- Confirmar disponibilidade antes de criar booking (chamar `/api/bookings/available`).

## Migração específica para Next.js — Guia passo a passo
Este guia descreve como mapear a estrutura atual (Nuxt) para Next.js (preferência: App Router). Inclui sugestões de organização, arquivos importantes e snippets.

1) Estrutura de rotas
  - `pages/index.vue` → `app/page.tsx` ou `app/page.jsx` (ou `pages/index.tsx` se usar Pages Router).
  - `pages/login.vue` → `app/login/page.tsx` ou `pages/login.tsx`.
  - Rotas dinâmicas: `pages/admin/[id].vue` → `app/admin/[id]/page.tsx`.

2) Componentes
  - Converter `*.vue` para React/TSX componentes. Mapear `props` e `emits` para props e callbacks do React.
  - `ServiceCard.vue` → `components/ServiceCard.tsx` (exportar `onBook(serviceId)` handler como prop).

3) Estado e hooks
  - `composables/useAuth.ts` → `hooks/useAuth.ts` ou `context/AuthProvider.tsx`.
  - `composables/useBooking.ts` → `hooks/useBooking.ts`.
  - Para SSR/SSG, use `getServerSideProps`/`getStaticProps` (Pages Router) ou `fetch` + `cookies` no App Router com `getServerSideProps` alternativo.

4) Middlewares e proteção de rotas
  - `middleware/auth.global.ts` → `middleware.ts` (Next.js) para proteção global ou wrapper `withAuth` em páginas.
  - Proteções de rota no client: criar HOC `withAuth` ou usar `useEffect` para redirecionamento se não autenticado.

5) APIs
  - `server/api/*` (Nuxt Server API) → Next.js API Routes:
    - Criar `pages/api/auth/login.ts`, `pages/api/auth/register.ts`, `pages/api/services/index.ts`, `pages/api/bookings/available.ts`, etc.
    - Exemplo básico de handler (Next.js Pages API):

```ts
// pages/api/bookings/available.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/server/utils/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const { date } = req.query
  // implementar lógica de disponibilidade similar ao Nuxt
  const slots = await getAvailableSlots(String(date))
  res.status(200).json(slots)
}
```

  - Se preferir manter `server/api` como backend separado, no Next.js consuma via `fetch('${process.env.API_URL}/bookings/available')`.

6) Prisma e DB
  - Mantenha `prisma/` e os scripts (`prisma db push`, `prisma migrate`, `prisma db seed`). Em Next.js, inicialize Prisma Client em `lib/prisma.ts` para singleton e importe nas API routes.

7) Autenticação
  - Opções:
    - Manter JWT e endpoints atuais; ao migrar, use cookies `httpOnly` para segurança SSR.
    - Ou adotar `NextAuth.js` se desejar integração pronta com providers.
  - Implementação mínima: replicar `server/utils/jwt.ts` em `pages/api/auth/*` e set cookie no response.

8) Estilos e Tailwind
  - Copiar `tailwind.config.ts` e `assets/css/tailwind.css` para o Next.js (instalar `tailwindcss`, `postcss`, `autoprefixer`).

9) Snippets úteis
  - Navegação client-side (Next.js App Router):

```ts
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push(`/schedule/date?serviceId=${serviceId}`)
```

  - Chamada API para criar booking (client):

```ts
const res = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, serviceId, datetime })
})
const json = await res.json()
```

## Próximos passos sugeridos
- Converter páginas críticas primeiro: `index`, `services`, `schedule/*`, `my-bookings`.
- Implementar `hooks/useAuth` e `hooks/useBooking` em paralelo.
- Criar rotas de API equivalentes ou apontar chamadas para backend existente.

---
Quer que eu gere os arquivos de exemplo (rotas, componentes e API handlers) convertidos para Next.js automaticamente?
