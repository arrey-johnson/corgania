# Database Design (Supabase / PostgreSQL)

Migrations: `supabase/migrations/0001_identity_orgs.sql`, `0002_verify_marketplace.sql`,
`0003_trade_messaging.sql`, `0004_content_finance_ops.sql`. RLS in each file, next to its tables.

## Principles
UUID PKs (`gen_random_uuid()`), FKs with explicit `on delete`, check constraints for
quantities/prices, `numeric(19,4)` + `currency char(3)` for money, timestamptz audit columns,
enums for every lifecycle. No float money. Append-only audit.

## Core graph
```
auth.users ── profiles ── organization_members ── organizations ──┬─ membership_applications
                                                                   ├─ verification_cases ─ verification_documents / inspections
                                                                   ├─ storefronts ─ products ─ product_images / price_tiers / specifications
                                                                   ├─ rfqs ─ quotations ─ orders ─ order_items / milestones / shipments / disputes
                                                                   ├─ conversations ─ messages        ├─ trade_documents / payment_records
                                                                   └─ subscriptions ─ invoices / commission_records
articles / article_categories · commodity_datasets / market_price_points / market_data_sources
notifications · audit_logs · platform_roles
```

## Authorisation helpers (SECURITY DEFINER, `stable`)
`is_platform_staff()`, `has_platform_role(role)`, `is_org_member(org)`, `is_org_admin(org)`,
`can_trade(org)` = approved ∧ ¬suspended ∧ ¬expired. Policies compose these — never raw
`auth.uid()` comparisons scattered per-table beyond ownership.

## Storage (private by default)
`verification-documents`, `trade-documents`, `message-attachments` (private, signed URLs,
org-scoped path prefix `<org_id>/…` enforced by storage policies); `public-media` for
storefront/product/article imagery only after moderation.

## State machines (mirrored in `src/lib/domain/`)
Membership: draft→submitted→under_review→info_required→verification_in_progress→approved/rejected (+suspended, expired).
Order: inquiry→quotation→negotiation→accepted→ordered→documentation→payment_arranged→preparing→inspection→shipped→delivered→completed (disputed branch). Invalid transitions rejected in domain layer and by DB check/trigger roadmap (Phase 4).

## Regenerating types
`supabase gen types typescript --linked > src/lib/database.types.ts` (see `ENVIRONMENT_SETUP.md`).
Hand-written `src/lib/types.ts` covers the foundation until a project is linked.
