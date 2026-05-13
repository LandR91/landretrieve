# LandRetrieve

Real estate platform for rural properties in Italy — targeting international buyers.

## Stack

- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: NestJS + Prisma + PostgreSQL
- **Infra**: Vercel (web) + Railway (api + db) + Cloudflare R2 (media)
- **Monorepo**: Turborepo

## Getting started

```bash
# Install dependencies
npm install

# Start infrastructure (Postgres + Redis)
docker-compose up -d

# Copy env
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start dev servers
npm run dev
```

## Apps

| App | Port | Description |
|-----|------|-------------|
| `apps/web` | 3000 | Next.js frontend |
| `apps/api` | 3001 | NestJS REST API |

## Packages

| Package | Description |
|---------|-------------|
| `packages/database` | Prisma client + schema |
| `packages/types` | Shared TypeScript types |
| `packages/config` | Shared tsconfig + ESLint config |

## Legal

© 2025 — SB.LAND — P.IVA IT 07385730481 | Tutti i diritti riservati
