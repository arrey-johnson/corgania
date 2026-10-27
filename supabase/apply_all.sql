-- Corgania full schema bootstrap (apply once in Supabase SQL Editor)
-- Project: jegnjxnupblstmnbgkam
-- Order: 0001 → 0002 → 0003 → 0004


-- ========== 0001_identity_orgs.sql ==========

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


-- ========== 0002_verify_marketplace.sql ==========

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


-- ========== 0003_trade_messaging.sql ==========

-- 0003 RFQs, quotations, messaging, orders, shipments, disputes
create type rfq_status as enum ('draft','published','closed','awarded','cancelled','expired');
create type quotation_status as enum ('submitted','revised','accepted','rejected','withdrawn','expired');
create type order_status as enum ('inquiry','quotation','negotiation','accepted','ordered','documentation','payment_arranged','preparing','inspection','shipped','delivered','completed','disputed','cancelled');
create type trade_mode as enum ('standard','corgania_assured');

create table public.rfqs (
  id uuid primary key default gen_random_uuid(),
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id), product_name text not null,
  category_id uuid references public.categories(id) on delete set null,
  specifications text not null default '', quantity numeric(19,4) not null check (quantity > 0),
  unit text not null, preferred_origin char(2), destination_country char(2) not null,
  delivery_location text not null, required_delivery_by date, payment_preferences text,
  deadline timestamptz not null, status rfq_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  seller_org_id uuid not null references public.organizations(id) on delete cascade,
  submitted_by uuid references public.profiles(id),
  unit_price numeric(19,4) not null check (unit_price >= 0), currency char(3) not null default 'USD',
  quantity_offered numeric(19,4) not null check (quantity_offered > 0),
  lead_time_days int check (lead_time_days >= 0), delivery_terms text,
  valid_until timestamptz not null, conditions text, status quotation_status not null default 'submitted',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (rfq_id, seller_org_id)
);
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  seller_org_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  rfq_id uuid references public.rfqs(id) on delete set null,
  subject text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (buyer_org_id <> seller_org_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id), sender_org_id uuid not null references public.organizations(id),
  body text not null, attachment_paths text[] not null default '{}',
  read_at timestamptz, created_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), reference text not null unique,
  buyer_org_id uuid not null references public.organizations(id), seller_org_id uuid not null references public.organizations(id),
  quotation_id uuid references public.quotations(id) on delete set null,
  trade_mode trade_mode not null default 'standard', status order_status not null default 'inquiry',
  currency char(3) not null default 'USD', total_amount numeric(19,4) not null default 0 check (total_amount >= 0),
  service_fee_amount numeric(19,4) not null default 0 check (service_fee_amount >= 0),
  payment_terms text, delivery_terms text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (buyer_org_id <> seller_org_id)
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, description text not null,
  quantity numeric(19,4) not null check (quantity > 0), unit text not null,
  unit_price numeric(19,4) not null check (unit_price >= 0), currency char(3) not null
);
create table public.order_milestones (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  status order_status not null, note text, actor_id uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.trade_documents (
  id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  doc_type text not null, storage_path text not null, file_name text not null,
  uploaded_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.payment_records (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  -- Records state/documents only. Settlement is established ONLY by an approved provider (ADR-007).
  method text, reference text, amount numeric(19,4) check (amount >= 0), currency char(3),
  status text not null default 'recorded' check (status in ('recorded','evidence_uploaded','verified_by_staff','rejected')),
  evidence_path text, recorded_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.shipments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  carrier text, tracking_reference text, origin text, destination text,
  shipped_at timestamptz, estimated_arrival timestamptz, delivered_at timestamptz,
  status text not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.disputes (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  opened_by_org uuid not null references public.organizations(id), reason text not null,
  status text not null default 'open' check (status in ('open','under_review','resolved','escalated')),
  resolution text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index idx_rfqs_status on public.rfqs(status, deadline);
create index idx_messages_conv on public.messages(conversation_id, created_at);
create index idx_orders_parties on public.orders(buyer_org_id, seller_org_id, status);

alter table public.rfqs enable row level security; alter table public.quotations enable row level security;
alter table public.conversations enable row level security; alter table public.messages enable row level security;
alter table public.orders enable row level security; alter table public.order_items enable row level security;
alter table public.order_milestones enable row level security; alter table public.trade_documents enable row level security;
alter table public.payment_records enable row level security; alter table public.shipments enable row level security;
alter table public.disputes enable row level security;

-- Buyers own RFQs; eligible (can_trade, seller) orgs may read published RFQs.
create policy rfqs_read on public.rfqs for select using (public.is_org_member(buyer_org_id) or public.is_platform_staff() or (status='published' and exists(select 1 from public.organizations o where public.is_org_member(o.id) and o.can_sell and public.can_trade(o.id))));
create policy rfqs_write on public.rfqs for all using (public.is_org_member(buyer_org_id)) with check (public.is_org_member(buyer_org_id) and public.can_trade(buyer_org_id));
create policy quotes_read on public.quotations for select using (public.is_org_member(seller_org_id) or public.is_platform_staff() or exists(select 1 from public.rfqs r where r.id=rfq_id and public.is_org_member(r.buyer_org_id)));
create policy quotes_write on public.quotations for all using (public.is_org_member(seller_org_id)) with check (public.is_org_member(seller_org_id) and public.can_trade(seller_org_id));
create policy conv_parties on public.conversations for all using (public.is_org_member(buyer_org_id) or public.is_org_member(seller_org_id) or public.is_platform_staff()) with check (public.is_org_member(buyer_org_id) or public.is_org_member(seller_org_id));
create policy msgs_parties on public.messages for all using (exists(select 1 from public.conversations c where c.id=conversation_id and (public.is_org_member(c.buyer_org_id) or public.is_org_member(c.seller_org_id))) or public.is_platform_staff()) with check (exists(select 1 from public.conversations c where c.id=conversation_id and public.is_org_member(sender_org_id) and (c.buyer_org_id=sender_org_id or c.seller_org_id=sender_org_id)));
create policy orders_parties on public.orders for all using (public.is_org_member(buyer_org_id) or public.is_org_member(seller_org_id) or public.is_platform_staff()) with check (public.is_org_member(buyer_org_id) or public.is_platform_staff());
create policy order_items_parties on public.order_items for select using (exists(select 1 from public.orders o where o.id=order_id and (public.is_org_member(o.buyer_org_id) or public.is_org_member(o.seller_org_id))) or public.is_platform_staff());
create policy milestones_parties on public.order_milestones for select using (exists(select 1 from public.orders o where o.id=order_id and (public.is_org_member(o.buyer_org_id) or public.is_org_member(o.seller_org_id))) or public.is_platform_staff());
create policy trade_docs_parties on public.trade_documents for all using (public.is_org_member(organization_id) or public.is_platform_staff()) with check (public.is_org_member(organization_id));
create policy payments_parties on public.payment_records for select using (exists(select 1 from public.orders o where o.id=order_id and (public.is_org_member(o.buyer_org_id) or public.is_org_member(o.seller_org_id))) or public.has_platform_role('finance'));
create policy shipments_parties on public.shipments for select using (exists(select 1 from public.orders o where o.id=order_id and (public.is_org_member(o.buyer_org_id) or public.is_org_member(o.seller_org_id))) or public.is_platform_staff());
create policy disputes_parties on public.disputes for all using (public.is_org_member(opened_by_org) or public.is_platform_staff()) with check (public.is_org_member(opened_by_org));


-- ========== 0004_content_finance_ops.sql ==========

-- 0004 CMS, market data, finance, notifications, audit, storage
create table public.article_categories (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null);
create table public.articles (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  excerpt text not null default '', body text not null default '',
  category_id uuid references public.article_categories(id) on delete set null,
  author_id uuid references public.profiles(id), featured_image_url text,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  published_at timestamptz, scheduled_for timestamptz,
  seo_title text, seo_description text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.market_data_sources (
  id uuid primary key default gen_random_uuid(), name text not null, provider text not null,
  licence_note text, base_url text, is_active boolean not null default false, created_at timestamptz not null default now()
);
create table public.commodity_datasets (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  unit text not null, currency char(3) not null default 'USD', source_id uuid references public.market_data_sources(id),
  description text, updated_at timestamptz not null default now()
);
create table public.market_price_points (
  id uuid primary key default gen_random_uuid(), dataset_id uuid not null references public.commodity_datasets(id) on delete cascade,
  period_start date not null, period_end date not null, value numeric(19,4) not null,
  source_attribution text not null, created_at timestamptz not null default now(),
  unique (dataset_id, period_start, period_end), check (period_end >= period_start)
);
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  price numeric(19,4) not null check (price >= 0), currency char(3) not null default 'USD',
  billing_period text not null check (billing_period in ('monthly','annual')), features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true
);
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id), status text not null default 'active',
  current_period_end timestamptz, created_at timestamptz not null default now()
);
create table public.invoices (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  number text not null unique, amount numeric(19,4) not null check (amount >= 0), currency char(3) not null,
  status text not null default 'issued' check (status in ('draft','issued','paid','overdue','void')),
  due_at timestamptz, created_at timestamptz not null default now()
);
create table public.commission_records (
  id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  amount numeric(19,4) not null, currency char(3) not null, basis text, created_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  type text not null, title text not null, body text not null default '', href text,
  read_at timestamptz, created_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid, organization_id uuid,
  action text not null, entity_type text not null, entity_id uuid, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.article_categories enable row level security; alter table public.articles enable row level security;
alter table public.market_data_sources enable row level security; alter table public.commodity_datasets enable row level security;
alter table public.market_price_points enable row level security; alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security; alter table public.invoices enable row level security;
alter table public.commission_records enable row level security; alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy articles_public_read on public.articles for select using (status='published' and (published_at is null or published_at <= now()) or public.is_platform_staff());
create policy articles_staff_write on public.articles for all using (public.has_platform_role('content_editor')) with check (public.has_platform_role('content_editor'));
create policy article_cats_read on public.article_categories for select using (true);
create policy market_public_read on public.commodity_datasets for select using (true);
create policy market_points_read on public.market_price_points for select using (true);
create policy market_staff_write on public.market_data_sources for all using (public.is_platform_staff()) with check (public.is_platform_staff());
create policy plans_read on public.subscription_plans for select using (is_active or public.is_platform_staff());
create policy subs_org on public.subscriptions for select using (public.is_org_member(organization_id) or public.has_platform_role('finance'));
create policy invoices_org on public.invoices for select using (public.is_org_member(organization_id) or public.has_platform_role('finance'));
create policy commissions_finance on public.commission_records for select using (public.has_platform_role('finance'));
create policy notifications_self on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy audit_staff_read on public.audit_logs for select using (public.is_platform_staff());
-- audit_logs: no client inserts (service role / triggers only)

-- Storage buckets: private by default; public-media only for moderated public imagery.
insert into storage.buckets (id, name, public) values
  ('verification-documents','verification-documents', false),
  ('trade-documents','trade-documents', false),
  ('message-attachments','message-attachments', false),
  ('public-media','public-media', true)
on conflict (id) do nothing;
-- Private buckets: org-scoped prefix <organization_id>/... enforced here; signed URLs issued server-side.
create policy storage_private_org_read on storage.objects for select using (
  bucket_id in ('verification-documents','trade-documents','message-attachments')
  and (public.is_platform_staff() or public.is_org_member(((storage.foldername(name))[1])::uuid)));
create policy storage_private_org_write on storage.objects for insert with check (
  bucket_id in ('verification-documents','trade-documents','message-attachments')
  and public.is_org_member(((storage.foldername(name))[1])::uuid));
create policy storage_public_read on storage.objects for select using (bucket_id='public-media');
create policy storage_public_write on storage.objects for insert with check (bucket_id='public-media' and auth.uid() is not null);

-- 0006 Membership plans: Founder's Plan (6 months free) + Standard Annual (USD 599)
-- Seller, buyer, or both â€” one organisation fee.

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
      'summary', 'USD 599 per organisation per year â€” seller, buyer, or both.'
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

-- Allow "replaced" when a new period/plan is assigned (existing check may only allow free text â€” status is unconstrained text).
comment on table public.subscription_plans is 'Corgania membership catalogue: founders (intro) and standard_annual (USD 599/yr).';
