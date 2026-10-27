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
