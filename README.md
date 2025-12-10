# Sistema de Agendamento de Salão - Xuxa's Salon

Sistema completo de agendamento para salão de beleza desenvolvido com Nuxt 3, Prisma e SQLite/PostgreSQL.

## 📋 Estrutura do Backend

### Modelos do Banco de Dados

- **User**: Usuários do sistema (id, name, phone)
- **Service**: Serviços oferecidos (id, name, duration, price)
- **Booking**: Agendamentos (id, date, status, userId, serviceId)

### API Routes

#### Services
- `GET /api/services` - Lista todos os serviços
- `POST /api/services` - Cria um novo serviço
- `PUT /api/services/[id]` - Atualiza um serviço
- `DELETE /api/services/[id]` - Remove um serviço

#### Bookings
- `GET /api/bookings` - Lista agendamentos (com filtros opcionais: userId, serviceId, status)
- `POST /api/bookings` - Cria um novo agendamento
- `PUT /api/bookings/[id]` - Atualiza status do agendamento (pending, confirmed, cancelled, completed)
- `GET /api/bookings/available` - Retorna horários disponíveis para uma data e serviço

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

O projeto está configurado para usar SQLite por padrão. Para PostgreSQL, edite o `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/salon_db?schema=public"
DATABASE_PROVIDER="postgresql"
```

### 3. Gerar Prisma Client e Criar Banco

```bash
npm run db:generate
npm run db:push
```

### 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

## 📡 Exemplos de Uso da API

### Criar um Serviço

```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corte de Cabelo",
    "duration": 60,
    "price": 5000
  }'
```

### Buscar Horários Disponíveis

```bash
curl "http://localhost:3000/api/bookings/available?date=2025-12-15&serviceId=1"
```

Retorna:
```json
{
  "date": "2025-12-15",
  "serviceId": 1,
  "serviceName": "Corte de Cabelo",
  "serviceDuration": 60,
  "availableSlots": [
    "2025-12-15T08:00:00.000Z",
    "2025-12-15T09:00:00.000Z",
    "2025-12-15T10:00:00.000Z",
    ...
  ],
  "totalSlots": 10
}
```

### Criar um Agendamento

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-15T10:00:00.000Z",
    "userId": 1,
    "serviceId": 1,
    "userName": "João Silva",
    "userPhone": "11999999999"
  }'
```

### Confirmar um Agendamento

```bash
curl -X PUT http://localhost:3000/api/bookings/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

### Cancelar um Agendamento

```bash
curl -X PUT http://localhost:3000/api/bookings/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled"
  }'
```

## 🗂️ Estrutura de Arquivos

```
server/
├── api/
│   ├── bookings/
│   │   ├── index.ts          # GET, POST bookings
│   │   ├── [id].ts           # PUT booking (status)
│   │   └── available.ts      # GET horários disponíveis
│   └── services/
│       ├── index.ts          # GET, POST services
│       └── [id].ts           # PUT, DELETE service
└── utils/
    └── prisma.ts             # Prisma Client singleton

prisma/
└── schema.prisma             # Schema do banco de dados
```

## 📝 Regras de Negócio

### Horários Disponíveis
- Horário de funcionamento: 08:00 às 18:00
- Intervalos de 1 hora
- Apenas um agendamento por horário
- Agendamentos cancelados não bloqueiam horários

### Status de Agendamento
- `pending`: Aguardando confirmação
- `confirmed`: Confirmado
- `cancelled`: Cancelado
- `completed`: Concluído

## 🛠️ Tecnologias

- **Nuxt 3**: Framework full-stack Vue.js
- **Prisma**: ORM para banco de dados
- **SQLite**: Banco de dados padrão (desenvolvimento)
- **TypeScript**: Tipagem estática

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview da build de produção
- `npm run db:push` - Sincroniza schema com o banco
- `npm run db:studio` - Abre Prisma Studio (UI para o banco)
- `npm run db:generate` - Gera Prisma Client

