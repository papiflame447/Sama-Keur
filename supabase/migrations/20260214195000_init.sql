create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','worker')),
  full_name text,
  phone text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  address text not null,
  rent_amount numeric(12,2),
  ai_knowledge text,
  house_rules text,
  worker_limit int not null default 2,
  created_at timestamptz not null default now()
);

create table if not exists public.worker_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(owner_id, worker_id)
);

create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_full_name text not null,
  tenant_phone text not null,
  lease_type text not null check (lease_type in ('short','long')),
  status text not null default 'pending_approval' check (status in ('pending_approval','active','inactive','rejected')),
  check_in_code text not null,
  start_date date not null,
  end_date date,
  contract_url text,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  checkin_reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases(id) on delete cascade,
  amount numeric(12,2) not null,
  method text not null check (method in ('wave','orange_money','cash','bank')),
  proof_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_media (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases(id) on delete cascade,
  media_type text not null check (media_type in ('id_card','checkin_video','checkout_video','receipt','signature')),
  file_url text not null,
  duration_seconds int,
  gps_lat float,
  gps_long float,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases(id) on delete cascade,
  role text not null check (role in ('guest','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns text language sql stable as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.worker_limit_enforcer()
returns trigger language plpgsql as $$
declare c int;
begin
  select count(*) into c from public.worker_access where owner_id = new.owner_id;
  if c >= 2 then
    raise exception 'WORKER_LIMIT_REACHED';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_worker_limit on public.worker_access;
create trigger trg_worker_limit before insert on public.worker_access for each row execute procedure public.worker_limit_enforcer();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.worker_access enable row level security;
alter table public.leases enable row level security;
alter table public.payments enable row level security;
alter table public.audit_media enable row level security;
alter table public.ai_logs enable row level security;

create policy "profiles self" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

create policy "owners properties" on public.properties for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "workers view assigned properties" on public.properties for select using (
  exists(select 1 from public.worker_access wa where wa.owner_id = properties.owner_id and wa.worker_id = auth.uid())
);

create policy "worker access owner full" on public.worker_access for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "worker access worker read" on public.worker_access for select using (worker_id = auth.uid());

create policy "leases owner full" on public.leases for all using (
  exists(select 1 from public.properties p where p.id = leases.property_id and p.owner_id = auth.uid())
) with check (
  exists(select 1 from public.properties p where p.id = leases.property_id and p.owner_id = auth.uid())
);

create policy "leases worker select" on public.leases for select using (
  exists(select 1 from public.properties p join public.worker_access wa on wa.owner_id = p.owner_id where p.id = leases.property_id and wa.worker_id = auth.uid())
);
create policy "leases worker insert" on public.leases for insert with check (
  exists(select 1 from public.properties p join public.worker_access wa on wa.owner_id = p.owner_id where p.id = leases.property_id and wa.worker_id = auth.uid())
  and status = 'pending_approval'
);

create policy "payments owner full" on public.payments for all using (
  exists(select 1 from public.leases l join public.properties p on p.id=l.property_id where l.id = payments.lease_id and p.owner_id = auth.uid())
) with check (
  exists(select 1 from public.leases l join public.properties p on p.id=l.property_id where l.id = payments.lease_id and p.owner_id = auth.uid())
);
create policy "payments worker append" on public.payments for insert with check (
  exists(select 1 from public.leases l join public.properties p on p.id=l.property_id join public.worker_access wa on wa.owner_id=p.owner_id where l.id = payments.lease_id and wa.worker_id = auth.uid())
);
create policy "payments worker read" on public.payments for select using (
  exists(select 1 from public.leases l join public.properties p on p.id=l.property_id join public.worker_access wa on wa.owner_id=p.owner_id where l.id = payments.lease_id and wa.worker_id = auth.uid())
);

create policy "media owner full" on public.audit_media for all using (
  exists(select 1 from public.leases l join public.properties p on p.id=l.property_id where l.id = audit_media.lease_id and p.owner_id = auth.uid())
) with check (
  exists(select 1 from public.leases l join public.properties p on p.id=l.property_id where l.id = audit_media.lease_id and p.owner_id = auth.uid())
);
create policy "media worker append/read" on public.audit_media for select using (
  exists(select 1 from public.leases l join public.properties p on p.id=l.property_id join public.worker_access wa on wa.owner_id=p.owner_id where l.id = audit_media.lease_id and wa.worker_id = auth.uid())
);
create policy "media worker insert" on public.audit_media for insert with check (
  exists(select 1 from public.leases l join public.properties p on p.id=l.property_id join public.worker_access wa on wa.owner_id=p.owner_id where l.id = audit_media.lease_id and wa.worker_id = auth.uid())
);

create policy "ai logs owner worker read" on public.ai_logs for select using (
  exists(
    select 1 from public.leases l join public.properties p on p.id=l.property_id
    left join public.worker_access wa on wa.owner_id=p.owner_id
    where l.id = ai_logs.lease_id and l.status='active' and (p.owner_id = auth.uid() or wa.worker_id = auth.uid())
  )
);
create policy "ai logs owner worker write" on public.ai_logs for insert with check (
  exists(
    select 1 from public.leases l join public.properties p on p.id=l.property_id
    left join public.worker_access wa on wa.owner_id=p.owner_id
    where l.id = ai_logs.lease_id and l.status='active' and (p.owner_id = auth.uid() or wa.worker_id = auth.uid())
  )
);

create index if not exists idx_properties_owner on public.properties(owner_id);
create index if not exists idx_leases_property on public.leases(property_id);
create index if not exists idx_payments_lease on public.payments(lease_id);
create index if not exists idx_media_lease on public.audit_media(lease_id);
create index if not exists idx_ai_lease on public.ai_logs(lease_id);
