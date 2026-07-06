export type DailyRewardState = {
  lastClaimDate: string | null;
  streak: number;
};

export type DailyRewardStatus = {
  amount: number;
  available: boolean;
  day: number;
  streak: number;
};

const rewardKey = 'almadi:daily-reward';
const rewards = [5000, 10000, 15000, 25000, 40000, 60000, 100000];

export const loadDailyRewardState = (): DailyRewardState => {
  const saved = readRewardState();
  return {
    lastClaimDate: saved?.lastClaimDate ?? null,
    streak: normalizeStreak(saved?.streak),
  };
};

export const getDailyRewardStatus = (state: DailyRewardState, now = new Date()): DailyRewardStatus => {
  const today = toDateKey(now);
  const streak = getCurrentStreak(state, today);
  const day = getRewardDay(state.lastClaimDate === today ? streak : streak + 1);
  return {
    amount: rewards[day - 1],
    available: state.lastClaimDate !== today,
    day,
    streak,
  };
};

export const claimDailyReward = (state: DailyRewardState, now = new Date()) => {
  const today = toDateKey(now);
  if (state.lastClaimDate === today) return null;

  const streak = getCurrentStreak(state, today) + 1;
  const day = getRewardDay(streak);
  const nextState = { lastClaimDate: today, streak };
  saveDailyRewardState(nextState);
  return { amount: rewards[day - 1], day, state: nextState };
};

const saveDailyRewardState = (state: DailyRewardState) => {
  localStorage.setItem(rewardKey, JSON.stringify(state));
};

const getCurrentStreak = (state: DailyRewardState, today: string) => {
  if (!state.lastClaimDate) return 0;
  if (state.lastClaimDate === today) return state.streak;
  if (daysBetween(state.lastClaimDate, today) === 1) return state.streak;
  return 0;
};

const getRewardDay = (streak: number) => ((Math.max(1, streak) - 1) % rewards.length) + 1;

const normalizeStreak = (value: number | undefined) => (Number.isFinite(value) && value ? Math.max(0, Math.round(value)) : 0);

const readRewardState = () => {
  try {
    const value = localStorage.getItem(rewardKey);
    return value ? (JSON.parse(value) as Partial<DailyRewardState>) : null;
  } catch {
    return null;
  }
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const daysBetween = (from: string, to: string) => {
  const fromTime = new Date(`${from}T00:00:00`).getTime();
  const toTime = new Date(`${to}T00:00:00`).getTime();
  return Math.round((toTime - fromTime) / 86400000);
};
