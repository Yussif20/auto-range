# Auto Range

Website and admin for **Auto Range**, a Land Rover / Range Rover service center: services, a genuine-parts catalog with WhatsApp ordering, online booking with status tracking, and an admin dashboard. Arabic (RTL, default) and English.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · next-intl · Prisma 6 + PostgreSQL

## Local setup

1. Start Postgres (any instance; the dev default is the Docker container on port 3500) and create a database `auto_range`.
2. `cp .env.example .env` and adjust `DATABASE_URL`.
3. `npm install` (runs `prisma generate`)
4. `npm run db:migrate` then `npm run db:seed`

The seed wipes and refills the catalog, content and sample bookings. It refuses to run with `NODE_ENV=production` unless `SEED_FORCE=1`. Reviews and stats in `prisma/seed/content.ts` are placeholders: replace them with real ones before launch.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:3000 (redirects to `/ar`) |
| `npm run build` | Runs the i18n check, then a production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma migrate, seed, and Studio |
| `npm run check:i18n` | Fails if `messages/ar.json` and `messages/en.json` have missing or empty keys |

## Structure

- `src/app/[locale]/`: pages; the root layout sets `lang`/`dir` from the locale
- `src/i18n/`: routing, request config, locale-aware `Link`
- `src/proxy.ts`: locale redirect (Next 16 "proxy", formerly middleware)
- `src/components/`: `brand/` (logo), `layout/` (header, footer, contact dock)
- `src/config/`: navigation
- `src/lib/`: Prisma client (`db.ts`), cached data loaders (`data/`), `localized()` for Ar/En column pairs
- `prisma/`: schema, migrations, seed (`seed/catalog.ts` models/services/parts, `seed/content.ts` reviews/FAQ/settings)
- Contact details, hours, socials, stats and booking slots live in the `Settings` row, not in code
- `messages/`: translations

## Brand tokens

Carbon `#0A0A0B` · surface `#131316` · signal red `#C8102E` (hover `#E0283F`, deep `#7A0A1C`) · text `#F4F4F5` · muted `#A1A1AA`. Defined in `src/app/globals.css` as Tailwind theme colors (`bg-brand`, `text-muted`, `border-line`, …).
