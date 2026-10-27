-- 0002 Corgania Verify + seller storefronts & products
create type verification_status as enum ('not_started','in_progress','info_required','recommended','approved','rejected','expired','suspended');
create type moderation_status as enum ('draft','pending_review','approved','rejected','archived');
create type pricing_mode as enum ('fixed','rfq','tiered');

create table public.verification_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  application_id uuid references public.membership_applications(id) on delete set null,
  kind application_kind not null, status verification_status not null default 'not_started',
  reviewer_id uuid references public.profiles(id), approver_id uuid references public.profiles(id),
  recommendation text, decision_notes text, expires_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint reviewer_ne_approver check (reviewer_id is null or approver_id is null or reviewer_id <> approver_id)
);
create table public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.verification_cases(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  doc_type text not null, storage_path text not null, file_name text not null,
  mime_type text not null, size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
  status moderation_status not null default 'pending_review', reviewer_notes text,
  uploaded_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.verification_cases(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  inspector_id uuid references public.profiles(id), scheduled_at timestamptz, completed_at timestamptz,
  location text, findings text, evidence_paths text[] not null default '{}',
  outcome text check (outcome in ('pass','fail','inconclusive')), created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  slug text not null unique, name text not null, description text, is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.storefronts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  slug text not null unique, display_name text not null, tagline text, description text,
  logo_url text, banner_url text, country char(2) not null, city text, industry text,
  certifications text[] not null default '{}', capabilities text[] not null default '{}',
  is_published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  storefront_id uuid not null references public.storefronts(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  slug text not null, name text not null, description text not null default '',
  country_of_origin char(2) not null, specifications jsonb not null default '{}'::jsonb,
  unit text not null, moq numeric(19,4) not null check (moq > 0),
  quantity_available numeric(19,4) not null default 0 check (quantity_available >= 0),
  currency char(3) not null default 'USD', pricing_mode pricing_mode not null default 'rfq',
  lead_time_days int check (lead_time_days >= 0), delivery_terms text,
  status moderation_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (storefront_id, slug)
);
create table public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null, alt_text text, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.price_tiers (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  min_quantity numeric(19,4) not null check (min_quantity > 0),
  unit_price numeric(19,4) not null check (unit_price >= 0), currency char(3) not null,
  unique (product_id, min_quantity)
);
create index idx_products_storefront on public.products(storefront_id, status);
create index idx_products_category on public.products(category_id, status);

alter table public.verification_cases enable row level security;
alter table public.verification_documents enable row level security;
alter table public.inspections enable row level security;
alter table public.categories enable row level security;
alter table public.storefronts enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.price_tiers enable row level security;

create policy verify_org on public.verification_cases for all using (public.is_org_member(organization_id) or public.is_platform_staff()) with check (public.is_org_admin(organization_id) or public.is_platform_staff());
create policy verify_docs_org on public.verification_documents for all using (public.is_org_member(organization_id) or public.is_platform_staff()) with check (public.is_org_member(organization_id) or public.is_platform_staff());
create policy inspections_staff on public.inspections for all using (public.is_platform_staff() or public.is_org_admin(organization_id)) with check (public.is_platform_staff());
create policy categories_read on public.categories for select using (true);
create policy categories_staff_write on public.categories for all using (public.is_platform_staff()) with check (public.is_platform_staff());
-- Storefront/product visible publicly only when published/approved AND seller can trade; owners/staff always.
create policy storefronts_read on public.storefronts for select using (public.is_org_member(organization_id) or public.is_platform_staff() or (is_published and public.can_trade(organization_id)));
create policy storefronts_write on public.storefronts for all using (public.is_org_admin(organization_id) or public.is_platform_staff()) with check (public.is_org_admin(organization_id) or public.is_platform_staff());
create policy products_read on public.products for select using (public.is_org_member(organization_id) or public.is_platform_staff() or (status='approved' and public.can_trade(organization_id)));
create policy products_write on public.products for all using (public.is_org_member(organization_id) or public.is_platform_staff()) with check (public.is_org_member(organization_id) and public.can_trade(organization_id) or public.is_platform_staff());
create policy product_images_read on public.product_images for select using (exists(select 1 from public.products p where p.id=product_id and (public.is_org_member(p.organization_id) or public.is_platform_staff() or (p.status='approved' and public.can_trade(p.organization_id)))));
create policy product_images_write on public.product_images for all using (exists(select 1 from public.products p where p.id=product_id and public.is_org_member(p.organization_id))) with check (exists(select 1 from public.products p where p.id=product_id and public.is_org_member(p.organization_id)));
create policy price_tiers_read on public.price_tiers for select using (exists(select 1 from public.products p where p.id=product_id and (public.is_org_member(p.organization_id) or public.is_platform_staff() or (p.status='approved' and public.can_trade(p.organization_id)))));
create policy price_tiers_write on public.price_tiers for all using (exists(select 1 from public.products p where p.id=product_id and public.is_org_member(p.organization_id))) with check (exists(select 1 from public.products p where p.id=product_id and public.is_org_member(p.organization_id)));
