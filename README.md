# oarch

A minimal next app with Prisma 8 and Prisma Composer.

## Run locally

```bash
npm run dev:composer
```

This builds the app and starts it with Composer. PostgreSQL projects get a local Prisma Postgres database and apply the contract automatically.

## Deploy

```bash
npm run deploy
```

The deploy script builds the framework output, provisions Prisma Postgres when selected, applies migrations, and deploys the app to Prisma Compute.

The starter users are inserted idempotently from `src/data/seed.ts` on the first database query through the Composer service binding.

## Layout

- `src/app` — UI / routing (Next.js)
- `src/data` — app data access (`listUsers`, seed)
- `src/prisma` — Prisma only (contract, db client, composer binding)

## Prisma

- Contract: `src/prisma/contract.prisma`
- DB client: `src/prisma/db.ts`
- Prisma and Composer config: `prisma.config.ts`
- Composer app: `module.ts` and `service.ts`

After changing the contract, run:

```bash
npm run contract:emit
```

To use the framework's development server directly, run `npm run dev`. This direct mode requires `DATABASE_URL`.
