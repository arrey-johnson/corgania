-- RLS isolation tests — run against a LOCAL Supabase (supabase test db) once seeded.
-- Asserts: org A cannot read org B products/documents/orders; unapproved org cannot trade.
-- Seed two orgs/users via fixtures, then (as authenticated user A):
--   select count(*) from public.products        where organization_id = '<orgB>';  -- expect 0 for non-approved/public rows
--   select count(*) from public.trade_documents where organization_id = '<orgB>';  -- expect 0
--   select count(*) from public.orders          where seller_org_id  = '<orgB>';   -- expect 0
--   select public.can_trade('<suspended-org>');                                    -- expect false
-- These run in CI with pgTAP in Phase 2; kept here so the security contract is versioned with the schema.
select 'rls-test-placeholder: seed fixtures in Phase 2' as note;
