import type { Session } from '@supabase/supabase-js';
import type { CityStats } from './gameTypes';
import { supabase } from './supabase';

export type MoneyLeaderboardItem = {
  countryId: string;
  money: number;
  playerName: string;
  updatedAt: string;
  userId: string;
};

type MoneyLeaderboardRow = {
  country_id: string;
  money: number;
  player_name: string;
  updated_at: string;
  user_id: string;
};

export const loadMoneyLeaderboard = async () => {
  const { data, error } = await supabase.rpc('get_money_leaderboard', { limit_count: 10 });
  if (error) throw error;
  const rows = Array.isArray(data) ? data as MoneyLeaderboardRow[] : [];
  return rows.map(normalizeRow);
};

export const saveMoneyLeaderboard = async (
  session: Session | null,
  countryId: string,
  cities: Record<string, CityStats>,
) => {
  const userId = session?.user.id;
  if (!userId) return;
  if (!isGmailUser(session)) return;
  const currentCity = cities[countryId];
  if (!currentCity) return;
  const { error } = await supabase.from('money_leaderboard').upsert({
    user_id: userId,
    player_name: getPlayerName(session),
    country_id: countryId,
    money: currentCity.money,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
};

const getPlayerName = (session: Session) => {
  const name = session.user.user_metadata?.full_name;
  if (typeof name === 'string' && name.trim()) return name.trim();
  return session.user.email ?? 'Игрок';
};

const isGmailUser = (session: Session) => {
  return session.user.email?.toLowerCase().endsWith('@gmail.com') ?? false;
};

const normalizeRow = (row: MoneyLeaderboardRow): MoneyLeaderboardItem => ({
  countryId: row.country_id,
  money: Number(row.money) || 0,
  playerName: row.player_name,
  updatedAt: row.updated_at,
  userId: row.user_id,
});
