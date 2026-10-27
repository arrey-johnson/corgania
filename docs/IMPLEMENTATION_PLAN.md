# Implementation Plan

| Phase | Scope | Depends on | Exit criteria |
|---|---|---|---|
| 0 Foundation ✅(this milestone) | Docs, Next.js/TS/Tailwind/design tokens, Supabase clients+middleware, migrations+RLS, env template, test harness | — | build/lint/typecheck/test green; app runs without Supabase env (public site) |
| 1 Public website ✅(this milestone) | Insights site, all public routes, CMS/market schemas + honest empty/unavailable states, SEO, responsive nav/footer | 0 | Pages render; no fabricated data; Playwright smoke |
| 2 Auth & onboarding | Supabase project 🔑, register/login/recovery, org creation, buyer/seller applications, private uploads, admin review (reviewer≠approver), inspections | 0, Supabase creds | Unapproved user provably cannot reach marketplace (e2e + RLS tests) |
| 3 Marketplace | Storefronts, product CRUD+moderation, buyer search/filters/saved, RFQ+quotations, messaging (Realtime) | 2 | Cross-org isolation tests pass |
| 4 Trade services | Orders, milestones, documents, inspections, shipments, disputes, fee records | 3 | State-transition tests; no fake settlement |
| 5 Finance & scale | Subscriptions, invoices, commissions, analytics, licensed market-data feed 🔑, enterprise procurement | 4, provider decisions | Reconciliation reports; load pass |

Sequence rule: **no UI for a workflow before its migration + RLS + domain state machine exist.**
