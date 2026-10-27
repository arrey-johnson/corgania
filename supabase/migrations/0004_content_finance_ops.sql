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
