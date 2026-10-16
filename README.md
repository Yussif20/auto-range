# Auto Range

Website and admin for **Auto Range**, a Land Rover / Range Rover service center: services, a genuine-parts catalog with WhatsApp ordering, online booking with status tracking, and an admin dashboard. Arabic (RTL, default) and English.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · next-intl · Prisma 6 + PostgreSQL · jose (admin session)

## Local setup

1. Start Postgres (any instance; the dev default is the Docker container on port 3500) and create a database `auto_range`.
2. `cp .env.example .env` and adjust `DATABASE_URL`. Set `SESSION_SECRET` to a random string of 32+ characters (`openssl rand -base64 32`).
3. `npm install` (runs `prisma generate`)
4. `npm run db:migrate` then `npm run db:seed`

The seed wipes and refills the catalog, content, sample bookings, part requests and messages. It refuses to run with `NODE_ENV=production` unless `SEED_FORCE=1`. Reviews and stats in `prisma/seed/content.ts` are placeholders: replace them with real ones before launch.

## Admin

`/ar/admin` or `/en/admin`. The seed creates the first admin from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Change the password under **My account** after the first sign-in.

- **Dashboard**: new bookings, cars in the workshop, new requests and messages, a 14-day booking chart, today's appointments.
- **Bookings**: filter by upcoming, past or status, and search. On the detail page, move a booking through its statuses (each change is logged and shown on the customer's tracking page), keep internal notes, and send ready-made WhatsApp messages in the customer's language.
- **Part requests / Messages**: inboxes with status changes and WhatsApp/email reply links.
- **Parts, categories, services, models, reviews, FAQ**: one config-driven editor (`src/lib/admin/resources.ts`). Records still in use are hidden instead of deleted.
- **Settings**: contact details, hours, socials, home-page numbers, booking slots, capacity and days off.

Security: the proxy only does a quick cookie check. Every admin page and server action verifies the signed session itself (`requireAdmin` / `adminPage` in `src/lib/auth/session.ts`).

## Images

`public/images/` holds placeholder photography generated for the demo (hero, services, models, workshop) as 1280–2400px WebP. Service and model rows point at these paths via the seed. Replace them with the workshop's real photos by uploading in the admin (parts: up to 8 photos, the first is the main one; services and models: one each) or by swapping the files. Uploads are shrunk in the browser (1600px, WebP), stored in Vercel Blob (store `auto-range-images`, `BLOB_READ_WRITE_TOKEN`), and deleted from Blob when removed from a record or when the record is deleted. Uploading is refused on the public demo. `next/image` serves AVIF/WebP at the right size.

Local runs: `vercel env pull` writes the production database into `.env.local`, and `next start` also reads `.env.production.local`. Keep only `BLOB_READ_WRITE_TOKEN` in `.env.local` and start a local build with `node --env-file=.env --env-file=.env.local node_modules/next/dist/bin/next start` so it uses the Docker database.

## SEO

- Every public page has a canonical URL and `hreflang` alternates (ar, en, x-default).
- `sitemap.xml` covers all pages, services and parts in both languages. `robots.txt` blocks `/admin` and `/track`.
- JSON-LD:
  - `AutoRepair` business (from Settings) and `FAQPage` on the home page
  - `Product` + `Offer` + `BreadcrumbList` on parts
  - `Service` on services
- Open Graph images: one site-wide, and one per part (name, price).
- Set `NEXT_PUBLIC_SITE_URL` in production, or canonical and sitemap URLs fall back to localhost.

## Deploy (Vercel + Neon)

Live at https://auto-range.vercel.app. Pushes to `main` deploy to production, and other branches get preview URLs.

- The database is Neon, provisioned through the Vercel Marketplace, which sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
- The `vercel-build` script runs `prisma migrate deploy` before every build. The build reads Settings and the catalog, so the database must be seeded once before the first deploy.
- Other env vars in Vercel: `SESSION_SECRET` (sensitive) and `NEXT_PUBLIC_SITE_URL`.
- First-time production seed. The seed wipes data first, so it refuses non-local databases unless forced:
  ```bash
  vercel env pull .env.production.local --environment=production
  # load DATABASE_URL and DATABASE_URL_UNPOOLED from that file into your shell, then:
  SEED_FORCE=1 SEED_SAMPLE_DATA=0 SEED_ADMIN_EMAIL= SEED_ADMIN_PASSWORD= npx tsx prisma/seed/index.ts
  ```
- Admin accounts: run `npm run admin:create:prod` after `vercel env pull .env.production.local --environment=production`. It asks for the email and password (hidden). The same command resets a forgotten password, and `npm run admin:create` does the same locally.
- Remove a test booking from production: `BOOKING_CODE=AR-XXXXX npm run booking:delete:prod`.

## Public demo (portfolio copy)

The same code runs as a separate Vercel project with `DEMO_MODE=1` and its own database:

- "Try the admin" signs in as `demo@example.com` with one click. Edits work; deleting, settings and password changes are off.
- WhatsApp links never target a number: WhatsApp opens its contact picker with the message filled in. Demo contact and customer numbers are in the unassigned `+20 0…` range.
- A banner marks the site as a demo. The demo is `noindex`, and robots.txt disallows everything, so it never competes with the real site.
- Nightly reset: Vercel Cron calls `/api/cron/reset-demo` at 01:00 UTC. It needs `DEMO_MODE=1`, `Authorization: Bearer $CRON_SECRET`, and the `DEMO_DATABASE` row in `AppFlag`, which only the demo database has. On the real site the route returns 404.
- Seed a new demo database once with `SEED_FORCE=1 SEED_DEMO=1 npx tsx prisma/seed/index.ts`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:3000 (redirects to `/ar`) |
| `npm run build` | Runs the i18n check, then a production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma migrate, seed, and Studio |
| `npm run check:i18n` | Fails if `messages/ar.json` and `messages/en.json` have missing or empty keys |

## Structure

- `src/app/[locale]/`: the root layout sets `lang`/`dir`. `(site)/` holds the public pages and chrome; `admin/` holds the login and the `(panel)/` back office.
- `src/app/actions/`: server actions (booking, tracking, part requests, contact, `admin/*`)
- `src/i18n/`: routing, request config, locale-aware `Link`
- `src/proxy.ts`: locale redirect plus the admin cookie check (Next 16 "proxy", formerly middleware)
- `src/components/`: `brand/`, `layout/`, `home/`, `parts/`, `services/`, `booking/`, `request-list/`, `admin/`, `ui/`
- `src/lib/`:
  - `db.ts`: Prisma client
  - `data/`: cached loaders, tagged for `updateTag`
  - `booking.ts`: Cairo-time dates, slot capacity
  - `auth/`: session handling
  - `admin/`: the editor config
- `prisma/`: schema, migrations, seed
- Contact details, hours, socials, stats and booking slots live in the `Settings` row, not in code
- `messages/`: translations (the `admin` namespace is only sent to admin pages)

## Brand tokens

Carbon `#0A0A0B` · surface `#131316` · signal red `#C8102E` (hover `#E0283F`, deep `#7A0A1C`) · text `#F4F4F5` · muted `#A1A1AA`. Defined in `src/app/globals.css` as Tailwind theme colors (`bg-brand`, `text-muted`, `border-line`, …).
