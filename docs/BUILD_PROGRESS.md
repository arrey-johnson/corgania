# Build Progress

## Milestone 1 — Phase 0 Foundation + Phase 1 Public Website ✅ (2026-10-21)
**Blocker on record:** SRS PDF was not in the workspace (empty repo; only logos attached). Built from the commissioning prompt as interim baseline — see `docs/ARCHITECTURE.md` ADR-001. Supply the PDF to trigger a traceability re-review.

### Implemented
- Docs: ARCHITECTURE, SRS_TRACEABILITY, DATABASE_DESIGN, IMPLEMENTATION_PLAN, DECISIONS, ENVIRONMENT_SETUP (+ this file).
- Next.js 15.5 (patched) + React 19 + TS strict + Tailwind v4; brand tokens `#123B7A / #DC2626 / white` in `globals.css`; official logos in `public/brand/` (unedited).
- Supabase foundation: browser/server/service clients (`@supabase/ssr`), session middleware, server guards (`lib/auth/guards.ts`) enforcing auth ≠ membership approval; env template; honest provider boundaries for market data & email (return `unavailable`, never fake).
- DB: 4 migrations (~40 tables, enums, FK/checks, `numeric(19,4)` money, audit, notifications, CMS, market data with attribution) + RLS on every table + org-isolation helpers (`can_trade`, `is_org_member`, reviewer≠approver check) + private storage buckets with org-prefix policies. RLS test contract in `supabase/tests/`.
- Public site (all routes in §5A): editorial homepage (hero, 4 divisions, dual seller/buyer CTAs, categories, honest market-intelligence state, 4-step process, CMS-driven Insights, CTA), about/markets(+cm)/commodities(+slug + Recharts)/products(+8 categories)/insights(+slug, SEO)/trade-opportunities/how-it-works/membership(+sellers/buyers)/contact (Zod-validated). SEO: metadata, sitemap, robots.
- Auth UI (login/register/forgot, Supabase-wired, explicit "not configured" state), onboarding hub + status, marketplace/admin layouts with **server-side** gates — anonymous visits verified to hit the gate, never content.
- Tests: 7 Vitest (state machines incl. "RFQ ≠ order", validation, component), Playwright smoke spec (auth gates + routes + responsive projects).

### Verified (2026-10-21)
`typecheck` ✅ · `lint` ✅ (0 errors) · `vitest` ✅ 7/7 · `next build` ✅ ~55 routes · browser-checked homepage + marketplace gate (localhost).
Playwright suite written but browsers not installed in this env (`npx playwright install` then `npm run test:e2e`).
Migrations **applied** to live project `jegnjxnupblstmnbgkam` (2026-10-25) via SQL Editor — see Update below.

### Incomplete / next milestone (Phase 3 Marketplace)
1. ~~Phase 2 Auth & onboarding~~ ✅ (2026-10-25) — see Update below.
2. Storefronts, product CRUD + moderation, buyer search/filters, RFQ + quotations, messaging.
3. pgTAP RLS isolation tests with seeded fixtures (carry-over).
4. Reconcile everything against the SRS PDF when supplied.

### External inputs required 🔑
SRS PDF · ~~Supabase project~~ (wired 2026-10-25) · ~~schema migrations~~ (applied 2026-10-25) · licensed market-data source · email provider · payment/escrow provider decision · vector logo · optional **database password** (for future CLI `db push` / typegen convenience).

## Update — Schema live ✅ (2026-10-25)
Applied `0001`→`0004` in the Supabase SQL Editor (each returned **Success. No rows returned**).
REST smoke (anon key): `profiles`, `organizations`, `products`, `rfqs`, `orders`, `articles`, `notifications`, `audit_logs` all **200**. Storage buckets + RLS from 0004 included.
Also applied `0005_onboarding_bootstrap.sql` (`create_organization_with_owner` RPC + first-owner insert policy).

## Update — Admin console fully wired ✅ (2026-10-25)
Every `/admin/*` nav item is a working screen (no placeholders): Overview (map+charts), Members (status controls), Applications, Verifications, Inspections, Stores (publish), Products (moderate), RFQs, Orders (+milestones), Trade Services (assured/shipments/docs/payments/disputes), Finance (plans/subs/invoices/commissions), Insights CMS, Analytics, Settings (staff roles). Mutations audit via service role where needed.

## Update — Phase 2 Auth & onboarding ✅ (2026-10-25)
- Hand-maintained `src/lib/database.types.ts` (CLI typegen still optional via linked project).
- Server Actions: org create, seller/buyer applications, verification document upload (private bucket, mime/size checks).
- Onboarding UI: org form, seller/buyer forms + uploads, status from DB.
- Admin: applications, verifications (review → info → recommend → independent approve), inspections, members directory; audit_logs via service role.
- Auth callback route; register metadata stores organisation name/intent.
- Staff seed template: `supabase/seed_staff_roles.sql` (replace UUIDs in SQL Editor).
- Tests: 11 Vitest passing; `typecheck` green.
**To use Verify:** create two staff users and grant `verification_reviewer` / `verification_approver` (different people) via the seed SQL.

## Update — Supabase credentials wired ✅ (2026-10-25)
Owner supplied project URL + anon + service-role keys for `jegnjxnupblstmnbgkam`.
- Written to `.env.local` only (gitignored; never committed). Auth health check: **200**.
- Combined bootstrap SQL kept at `supabase/apply_all.sql` (0001→0004).
- **Security:** service-role was pasted in chat — rotate it in Supabase Dashboard → Settings → API if this conversation may be shared; keep the new key only in `.env.local`.

## Update — Official logo ✅ (2026-10-21, later)
Owner supplied the official transparent logo. Replaced all JPG usages with `public/brand/corgania-logo.png`; navbar logo enlarged to 76px (desktop) / 56–64px (mobile) with taller headers across public, auth, onboarding, marketplace and admin layouts. Verified visually at 1440px (logo measured 190×76px) and 390px mobile; `typecheck` + `build` re-passed.
Owner then supplied the official standalone emblem (`public/brand/corgania-icon.png`, 1024×1024): installed as the browser title-bar icon (`src/app/icon.png` + `src/app/apple-icon.png`; verified `<link rel="icon" …/icon.png>` in the served page) and as the homepage hero mark, replacing the earlier cropped mark.
Homepage hero uses a full-bleed background photo with a deep-blue legibility overlay (strongest behind the copy) and a red headline underline for contrast on photography. Background image (owner-selected, final): `public/images/hero-africa-trade-network.jpg` — Africa at the centre of the global trade network, focal point shifted right (`object-[68%_center]`) so the continent sits beside the headline; the previous supply-chain vessel photo was removed at the owner's request. Verified desktop + mobile; `typecheck` + `build` re-passed.
