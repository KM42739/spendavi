-- Spendavi Supabase schema
-- This schema is for the future account-based version.
-- Start with local-only storage in the mobile MVP, then move users to this structure.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  monthly_income numeric default 0,
  current_balance numeric default 0,
  days_to_payday integer default 0,
  monthly_essentials numeric default 0,
  emergency_buffer numeric default 0,
  main_goal text default 'Clear high-interest debt',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null default 0,
  due_day integer not null default 1 check (due_day >= 1 and due_day <= 31),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance numeric not null default 0,
  apr numeric not null default 0,
  minimum_payment numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.spend_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null default 0,
  risk_label text not null check (risk_label in ('Green', 'Amber', 'Red')),
  safe_before numeric not null default 0,
  safe_after numeric not null default 0,
  decision_message text,
  debt_impact text,
  created_at timestamptz default now()
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  barcode text,
  item_name text,
  entered_price numeric default 0,
  spend_check_id uuid references public.spend_checks(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.bills enable row level security;
alter table public.debts enable row level security;
alter table public.spend_checks enable row level security;
alter table public.scans enable row level security;

create policy "profiles are private" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "bills are private" on public.bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "debts are private" on public.debts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "spend checks are private" on public.spend_checks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "scans are private" on public.scans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
