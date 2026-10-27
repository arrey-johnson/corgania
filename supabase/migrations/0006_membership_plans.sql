-- 0006 Membership plans: Founder's Plan (6 months free) + Standard Annual (USD 599)
-- Seller, buyer, or both — one organisation fee.

insert into public.subscription_plans (slug, name, price, currency, billing_period, features, is_active)
values
  (
    'founders',
    'Founder''s Plan',
    0,
    'USD',
    'annual',
    jsonb_build_object(
      'freeDays', 180,
      'convertsTo', 'standard_annual',
      'enrollmentEnds', '2027-10-25',
      'badge', 'Founding Member',
      'intents', jsonb_build_array('seller', 'buyer', 'both'),
      'summary', 'Six months free after Corgania Verify approval during the founding window; then Standard Annual at USD 599/year.'
    ),
    true
  ),
  (
    'standard_annual',
    'Standard Annual',
    599,
    'USD',
    'annual',
    jsonb_build_object(
      'intents', jsonb_build_array('seller', 'buyer', 'both'),
      'summary', 'USD 599 per organisation per year — seller, buyer, or both.'
    ),
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  price = excluded.price,
  currency = excluded.currency,
  billing_period = excluded.billing_period,
  features = excluded.features,
  is_active = excluded.is_active;

-- Allow "replaced" when a new period/plan is assigned (existing check may only allow free text — status is unconstrained text).
comment on table public.subscription_plans is 'Corgania membership catalogue: founders (intro) and standard_annual (USD 599/yr).';
