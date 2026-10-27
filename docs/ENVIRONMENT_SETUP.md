# Environment Setup

## 1. Prerequisites
Node ≥ 20, npm, (optional) Supabase CLI + Docker for local DB/RLS tests.

## 2. Install & run (no Supabase needed for public site)
```bash
npm install
cp .env.example .env.local   # leave Supabase vars blank to run public site only
npm run dev                  # http://localhost:3000
```

## 3. Connect Supabase (required from Phase 2)
1. Create a project at supabase.com → note Project URL + anon + service-role keys.
2. Fill `.env.local` (see `.env.example`). **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser; it is server-only.
3. Apply migrations (one of):
   - **SQL Editor (recommended first time):** open Project → SQL → New query, paste the full contents of `supabase/apply_all.sql`, Run. Confirm no errors.
   - **CLI:** set `DATABASE_URL` (Settings → Database → URI, include password), then `npx supabase db push --db-url "$DATABASE_URL"`.
4. In Auth settings enable email confirmations; set Site URL + redirect URLs for `/auth/callback` and `http://localhost:3000/**`.
5. Generate types: `npm run db:types` (command printed by the script).
6. Create the first staff user: sign up in-app, then in SQL:
   `insert into public.platform_roles(user_id, role) values ('<uuid>','super_admin');`

## Troubleshooting
- **Runtime Error `[object Event]` / chunk 404s in dev:** the dev server and a production
  build were run at the same time and shared the `.next` folder, so the open page tried to
  load stale chunks that no longer exist (script-load `Event`s surface this way in the dev
  overlay). Fix: stop the dev server, delete `.next`, restart `npm run dev`, hard-refresh.
  Never run `npm run build` while `npm run dev` is running.

## 4. Checks
```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run test:e2e   # requires: npx playwright install
```

## 5. Market data (Commodities Desk)
Set `MARKET_DATA_PROVIDER=worldbank_pink_sheet` (default in `.env.example`). No API key.
Corgania loads **monthly** USD benchmarks from the World Bank Pink Sheet (cocoa, coffee,
cotton, Cameroon sawnwood) with source, unit and vintage. Restart `npm run dev` after changing env.

## 6. Still required from the business 🔑
SRS PDF · Supabase project credentials · email provider (Resend/Postmark/etc.) ·
payment/escrow provider decision · final brand vector logo + hex confirmation.

