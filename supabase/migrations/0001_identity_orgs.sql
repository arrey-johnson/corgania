-- 0001 Identity, organisations, membership. RLS is the final authorisation authority.
create extension if not exists pgcrypto;

create type membership_status as enum ('draft','submitted','under_review','info_required','verification_in_progress','approved','rejected','suspended','expired');
create type org_member_role as enum ('owner','admin','member','viewer');
create type platform_role as enum ('super_admin','operations','verification_reviewer','verification_approver','finance','content_editor','support');
create type application_kind as enum ('seller','buyer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', email text not null default '',
  phone text, avatar_url text, locale text not null default 'en',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.platform_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role platform_role not null, created_at timestamptz not null default now(),
  primary key (user_id, role)
);
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null, trading_name text,
  registration_country char(2) not null, registration_number text,
  legal_address jsonb not null default '{}'::jsonb,
  contact_email text, contact_phone text, website text,
  industry text, description text,
  can_buy boolean not null default false, can_sell boolean not null default false,
  membership_status membership_status not null default 'draft',
  membership_expires_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (registration_country, registration_number)
);
create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role org_member_role not null default 'member', is_active boolean not null default true,
  invited_by uuid references public.profiles(id), created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kind application_kind not null, status membership_status not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  submitted_by uuid references public.profiles(id), submitted_at timestamptz,
  reviewed_by uuid references public.profiles(id), review_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index idx_org_members_user on public.organization_members(user_id);
create index idx_applications_org on public.membership_applications(organization_id, status);

-- Authorisation helpers (security definer avoids RLS recursion)
create or replace function public.is_platform_staff() returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.platform_roles where user_id = auth.uid()) $$;
create or replace function public.has_platform_role(r platform_role) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.platform_roles where user_id = auth.uid() and role in (r,'super_admin')) $$;
create or replace function public.is_org_member(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.organization_members where organization_id=o and user_id=auth.uid() and is_active) $$;
create or replace function public.is_org_admin(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.organization_members where organization_id=o and user_id=auth.uid() and is_active and role in ('owner','admin')) $$;
create or replace function public.can_trade(o uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.organizations where id=o and membership_status='approved'
     and (membership_expires_at is null or membership_expires_at > now())) $$;

alter table public.profiles enable row level security;
alter table public.platform_roles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.membership_applications enable row level security;

create policy profiles_self on public.profiles for all using (id = auth.uid() or public.is_platform_staff()) with check (id = auth.uid() or public.is_platform_staff());
create policy platform_roles_staff on public.platform_roles for all using (public.is_platform_staff()) with check (public.has_platform_role('super_admin'));
create policy orgs_member_read on public.organizations for select using (public.is_org_member(id) or public.is_platform_staff());
create policy orgs_admin_write on public.organizations for update using (public.is_org_admin(id) or public.is_platform_staff()) with check (public.is_org_admin(id) or public.is_platform_staff());
create policy orgs_create on public.organizations for insert with check (auth.uid() is not null);
create policy members_read on public.organization_members for select using (public.is_org_member(organization_id) or public.is_platform_staff());
create policy members_admin_write on public.organization_members for all using (public.is_org_admin(organization_id) or public.has_platform_role('super_admin')) with check (public.is_org_admin(organization_id) or public.has_platform_role('super_admin'));
create policy apps_org on public.membership_applications for all using (public.is_org_member(organization_id) or public.is_platform_staff()) with check (public.is_org_member(organization_id) or public.is_platform_staff());

-- Auto-create profile on signup
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as
$$ begin insert into public.profiles(id,email,full_name) values (new.id, coalesce(new.email,''), coalesce(new.raw_user_meta_data->>'full_name','')) on conflict (id) do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
