# Corgania — Architecture

> **SRS status (blocker, recorded 2026-10-21):** No SRS PDF was present in the workspace
> (empty git repo; only the two logo images were attached). The PDF could not be read.
> This architecture is therefore derived from the detailed commissioning prompt, which
> is treated as the interim requirements baseline. **When the SRS PDF is supplied, it
> supersedes this document where it is more precise** — re-run the traceability review
> in `SRS_TRACEABILITY.md` before Phase 2.

## 1. System shape
One Next.js 15 (App Router, TypeScript strict) monolith, deployable as a single app now,
splittable later by route group. Supabase (Postgres + Auth + Storage + Realtime) is the
only backend platform. No separate API server, no second auth system.

```
(public)      Insights corporate site, markets, commodities, CMS articles  — anonymous
(auth)        login / register / forgot-password                          — Supabase Auth
(onboarding)  organisation creation, buyer/seller applications            — authenticated, NOT yet approved
(marketplace) products, suppliers, RFQs, dashboards, messages, orders     — approved org members only
(admin)       operations console                                          — platform staff roles only
```

## 2. Layering (enforced by folder, reviewed in PRs)
| Layer | Location | Rule |
|---|---|---|
| UI | `src/components/**`, route `page.tsx` | No direct Supabase calls in presentational components |
| Validation | `src/lib/validation/**` (Zod) | Same schema reused client + server |
| Domain / state machines | `src/lib/domain/**` | Pure, unit-tested; no I/O |
| Data access / services | `src/lib/services/**` | Only place (besides `lib/supabase`) that talks to Postgres |
| Providers (external) | `src/lib/providers/**` | Market-data, email, payments behind interfaces; honest "not configured" state |
| AuthZ | middleware + Server Actions + **RLS** | Defence in depth; RLS is the final authority |

Server Components by default; Server Actions for user mutations; Route Handlers only for
webhooks / externally-callable APIs. Every Server Action re-authenticates and re-authorises
server-side — frontend hiding is never an authorisation mechanism.

## 3. Authorisation model (critical)
Authentication (Supabase Auth: *who you are*) ≠ authorisation (*what your organisation may do*).
- `profiles` (1:1 auth user) → `organization_members` (org, user, org-role, capabilities buyer/seller)
- Platform staff: `platform_roles` (super_admin, ops, verification_reviewer, verification_approver, finance, content, support) — reviewer ≠ approver for verification.
- Marketplace gate: org `membership_status = 'approved'` AND not suspended/expired AND member active.
  Enforced in middleware (UX), in Server Actions (logic), and in RLS helper
  `public.can_trade(org)` / `public.is_org_member(org)` (authority).
- A single global `user.role` is explicitly **not** used.

## 4. Data & integrity
Postgres (migrations in `supabase/migrations/`, never dashboard-only DDL). UUID PKs, FKs,
checks, unique constraints, `numeric(19,4)` money + explicit `currency char(3)` (never float),
`created_at/updated_at`, append-only `audit_logs`. RLS enabled on every exposed table;
private Storage buckets with signed URLs for verification/trade documents.

## 5. Honesty rules (non-negotiable)
No fabricated market prices, trade statistics, member counts, or payment settlement.
Providers return `unavailable` until a real source is configured; UI renders an explicit
unavailable/demo state. No fake payment gateway/escrow.

## 6. Quality gates
`typecheck` (strict TS) · `lint` · Vitest (domain/services/components) · Playwright (auth gates,
responsive) · SQL/RLS tests against a local Supabase before any release. See `IMPLEMENTATION_PLAN.md`.
