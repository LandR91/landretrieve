# LandRetrieve.com

> Piattaforma SaaS immobiliare globale per immobili rurali  
> "our hills, your home" — SB.Land | P.IVA IT 07385730481

---

## Stack

| Layer | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui |
| Backend | NestJS + Node.js |
| Database | PostgreSQL + Prisma ORM |
| Cache/Queue | Redis (Upstash) + Bull |
| Storage | Cloudflare R2 |
| Auth | JWT + Refresh Token + Next-Auth |
| Pagamenti | Stripe |
| Email | Resend + React Email |
| Realtime | Socket.io |
| Monorepo | Turborepo |
| Deploy | Vercel (FE) + Railway (BE + DB) |

---

## Struttura

```
landretrieve/
├── apps/
│   ├── web/          # Next.js 14 — porta 3000
│   └── api/          # NestJS — porta 3001
├── packages/
│   ├── database/     # Prisma schema + client
│   ├── types/        # TypeScript shared types
│   └── config/       # Configurazioni condivise
├── turbo.json
├── docker-compose.yml
└── .env.example
```

---

## Setup locale

### 1. Prerequisiti

- Node.js >= 20
- npm >= 10
- Docker + Docker Compose

### 2. Clona e installa

```bash
git clone https://github.com/landr91/landretrieve.git
cd landretrieve
npm install
```

### 3. Variabili d'ambiente

```bash
cp .env.example .env
# Modifica .env con i tuoi valori
```

### 4. Avvia database e Redis

```bash
docker-compose up -d
```

### 5. Configura il database

```bash
# Genera il Prisma client
npm run db:generate

# Esegui le migrations
npm run db:migrate

# Popola con dati di test
npm run db:seed
```

### 6. Avvia in sviluppo

```bash
# Avvia tutto il monorepo
npm run dev

# Oppure singole app
cd apps/web && npm run dev   # http://localhost:3000
cd apps/api && npm run dev   # http://localhost:3001
```

### 7. Prisma Studio (GUI database)

```bash
npm run db:studio
# Apre http://localhost:5555
```

---

## Script disponibili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia tutto in dev mode |
| `npm run build` | Build completo |
| `npm run lint` | Lint di tutti i package |
| `npm run type-check` | TypeScript check |
| `npm run db:push` | Push schema senza migration |
| `npm run db:migrate` | Crea e applica migration |
| `npm run db:seed` | Popola il DB con dati test |
| `npm run db:studio` | Apre Prisma Studio |

---

## API Documentation

In sviluppo, Swagger è disponibile su:
```
http://localhost:3001/api/docs
```

---

## Deploy

- **Frontend**: Vercel — collega repo GitHub, deploy automatico da `main`
- **Backend + DB**: Railway — configura servizi postgres + redis + api
- **Env vars**: configurare su Vercel e Railway dal pannello
