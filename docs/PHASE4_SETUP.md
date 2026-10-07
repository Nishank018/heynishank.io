# Phase 4 Services

All integrations are opt-in. Without credentials, public projects fall back to `content/projects.ts`, the admin stays read-only, rate limits fail open, contact delivery returns `not_configured`, and the view counter remains unavailable.

## Database

Copy `.env.example` to `.env.local` and set `DATABASE_URL` to the Neon pooled PostgreSQL URL. Run `pnpm db:migrate`, then `pnpm db:seed`. The schema and initial SQL live in `lib/db/schema.ts` and `drizzle/`. The seed command is safe to rerun and upserts the content projects by slug.

## Private CMS

Create a GitHub OAuth app with callback `/api/auth/callback/github`. Set `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET`, and `AUTH_GITHUB_ALLOWED_USERNAME` to the one permitted GitHub login. Visit `/admin`; all writes repeat the session check in their server actions. Keep the OAuth credentials and database URL on the server.

## Redis and Contact Delivery

Set the two Upstash REST variables to enable the sliding-window API limits and optional page-view counter. `showViewCounter` remains off by default in `content/site.ts`.

Set `RESEND_API_KEY`, `CONTACT_EMAIL`, and a verified `CONTACT_FROM_EMAIL` to enable contact form delivery. The recipient address is read only in `app/api/contact/route.ts`; it is not sent to the browser. Contact request bodies are Zod-validated and rate-limited before delivery.

Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin to populate `sitemap.xml`, `robots.txt`, and metadata image URLs.
