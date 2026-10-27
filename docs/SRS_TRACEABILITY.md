# Requirements Traceability Matrix

> Baseline = commissioning prompt (SRS PDF not in workspace — see `ARCHITECTURE.md`).
> Status: ✅ done this milestone · 🟡 scaffolded/partial · ⬜ planned · 🔑 needs external credential/decision

| ID | Requirement | Where | Status |
|---|---|---|---|
| PUB-01 | Public site: home, about, markets(+country), commodities(+slug), products(+category), insights(+slug), trade-opportunities, how-it-works, membership(+sellers/buyers), contact | `src/app/(public)/**` | ✅ (content DB-ready; honest empty states) |
| PUB-02 | Hero "Africa's Trade. The World's Opportunity.", dual seller/buyer CTAs | `(public)/page.tsx` | ✅ |
| PUB-03 | Market intelligence with source, unit, currency, period, updated-at; never fabricated | `lib/providers/market-data.ts`, `0004` tables | 🟡 interface + schema; 🔑 real data source |
| PUB-04 | CMS articles: categories, authors, drafts, scheduling, SEO, related, search | `articles` tables, `(public)/insights` | 🟡 schema + list UI (empty state) |
| AUTH-01 | Supabase Auth email/password, verify, recovery, sessions, protected routes | `(auth)/**`, `middleware.ts`, `lib/supabase/*` | 🟡 UI + wiring; 🔑 Supabase project |
| AUTH-02 | Registration ≠ marketplace access; 9 membership statuses | `membership_status` enum, `can_trade()` | ✅ in schema/RLS; 🟡 onboarding UI next |
| ORG-01 | Organisations separate from users; multi-user, buyer+seller capabilities, org roles | `organizations`, `organization_members` | ✅ schema |
| VER-01 | Seller verification: docs, review, inspection, reviewer≠approver, expiry, audit | `verification_*`, `inspections` | ✅ schema; ⬜ Phase 2 UI |
| VER-02 | Separate buyer checklist | `verification_cases.kind` | ✅ schema |
| MKT-01 | Seller storefronts (branding, verification badge, catalogue) | `storefronts`, `(marketplace)/marketplace/suppliers` | ✅ schema; ⬜ Phase 3 UI |
| MKT-02 | Products: specs, MOQ, tiers, currency, lead time, fixed/RFQ mode, moderation; suspended seller ⇒ not tradeable | `products*`, RLS `can_trade` | ✅ schema/RLS |
| MKT-03 | Buyer search/filter (country, industry, MOQ), save, compare | — | ⬜ Phase 3 |
| RFQ-01 | RFQ lifecycle draft→published→quoted→accepted/expired; partial fulfilment allowed | `rfqs`, `quotations`, domain state machine | ✅ schema + pure state machine + tests |
| MSG-01 | Org-scoped messaging, attachments, unread, realtime-ready | `conversations`, `messages` | ✅ schema |
| ORD-01 | 12-stage order lifecycle; Standard vs Assured trade; no fake settlement | `orders*`, `payments` (records only) | ✅ schema + state machine |
| ADM-01 | Admin console: members, verifications, products, RFQs, orders, finance, CMS, audit; granular staff roles; URL-guessing blocked | `(admin)/**`, `platform_roles`, middleware | 🟡 shell + guard; ⬜ Phase 2–5 |
| FIN-01 | Plans, subscriptions, invoices, commissions (numeric money) | `0004` | ✅ schema; ⬜ Phase 5 |
| SEC-01 | RLS everywhere, private buckets, signed URLs, audit, validation, no secrets in client | migrations, `lib/env.ts` | ✅ foundation; 🔑 keys |
| NTF-01 | In-app notifications; email provider layer, no silent fake delivery | `notifications`, `lib/providers/email.ts` | 🟡 schema/interface |
| TST-01 | Vitest + RTL + Playwright + RLS tests | `tests/`, `e2e/`, `supabase/tests/` | 🟡 unit+e2e smoke; RLS SQL test file stub |

## Ambiguities / risks (need owner decision, not blocking Phase 1)
1. **SRS PDF missing** — highest risk: fees, Assured-Trade mechanics, membership tiers may differ.
2. Assured Trade: escrow/documentary-credit provider not named → schema records state only. 🔑
3. Market data source (exchange/licence) not named → provider interface only. 🔑
4. Commission/fee schedule, membership pricing, verification SLAs — unspecified.
5. Languages (EN/FR for Cameroon?) and launch countries beyond Cameroon — assumed EN, Cameroon-first.
