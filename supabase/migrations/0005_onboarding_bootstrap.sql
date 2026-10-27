-- 0005 Onboarding bootstrap: first-owner membership without chicken-egg RLS,
-- verification status helpers, and authenticated RPC for org creation.

create or replace function public.create_organization_with_owner(
  p_legal_name text,
  p_registration_country char(2),
  p_trading_name text default null,
  p_registration_number text default null,
  p_contact_email text default null,
  p_contact_phone text default null,
  p_can_buy boolean default false,
  p_can_sell boolean default false
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  oid uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  -- One active org ownership path per user for v1 onboarding.
  if exists (
    select 1 from public.organization_members
    where user_id = auth.uid() and is_active and role = 'owner'
  ) then
    raise exception 'You already own an organisation';
  end if;

  insert into public.organizations (
    legal_name, trading_name, registration_country, registration_number,
    contact_email, contact_phone, can_buy, can_sell, membership_status
  ) values (
    p_legal_name, p_trading_name, upper(p_registration_country), nullif(p_registration_number, ''),
    p_contact_email, p_contact_phone, coalesce(p_can_buy, false), coalesce(p_can_sell, false), 'draft'
  ) returning id into oid;

  insert into public.organization_members (organization_id, user_id, role, is_active)
  values (oid, auth.uid(), 'owner', true);

  return oid;
end;
$$;

revoke all on function public.create_organization_with_owner(
  text, char, text, text, text, text, boolean, boolean
) from public;
grant execute on function public.create_organization_with_owner(
  text, char, text, text, text, text, boolean, boolean
) to authenticated;

-- Allow the first owner insert if RPC is not used (defense in depth).
create policy members_bootstrap_owner on public.organization_members
  for insert
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and not exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_members.organization_id
    )
  );
