create table if not exists public.city_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  country_id text not null,
  cities jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.city_saves enable row level security;

create policy "read own city save"
  on public.city_saves for select
  using (auth.uid() = user_id);

create policy "insert own city save"
  on public.city_saves for insert
  with check (auth.uid() = user_id);

create policy "update own city save"
  on public.city_saves for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
