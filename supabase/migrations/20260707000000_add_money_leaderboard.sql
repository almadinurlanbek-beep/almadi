create table if not exists public.money_leaderboard (
  user_id uuid primary key references auth.users (id) on delete cascade,
  player_name text not null,
  country_id text not null,
  money bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.money_leaderboard enable row level security;

create policy "read own money leaderboard row"
  on public.money_leaderboard for select
  using (auth.uid() = user_id);

create policy "insert own money leaderboard row"
  on public.money_leaderboard for insert
  with check (auth.uid() = user_id);

create policy "update own money leaderboard row"
  on public.money_leaderboard for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.get_money_leaderboard(limit_count integer default 10)
returns table (
  user_id uuid,
  player_name text,
  country_id text,
  money bigint,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    money_leaderboard.user_id,
    money_leaderboard.player_name,
    money_leaderboard.country_id,
    money_leaderboard.money,
    money_leaderboard.updated_at
  from public.money_leaderboard
  order by money_leaderboard.money desc, money_leaderboard.updated_at asc
  limit greatest(1, least(limit_count, 50));
$$;
