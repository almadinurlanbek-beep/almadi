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
  inner join public.profiles
    on profiles.user_id = money_leaderboard.user_id
  where profiles.email like '%@gmail.com'
  order by money_leaderboard.money desc, money_leaderboard.updated_at asc
  limit greatest(1, least(limit_count, 50));
$$;
