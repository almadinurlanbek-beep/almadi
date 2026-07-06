export type PlaytimeRewardId = 'two-minutes' | 'five-minutes' | 'ten-minutes' | 'twenty-minutes';

export type PlaytimeReward = {
  id: PlaytimeRewardId;
  label: string;
  secondsRequired: number;
  amount: number;
};

export type PlaytimeRewardState = {
  dateKey: string;
  secondsPlayed: number;
  claimedIds: PlaytimeRewardId[];
};

export type PlaytimeRewardStatus = PlaytimeReward & {
  available: boolean;
  claimed: boolean;
  remainingSeconds: number;
};

const storageKey = 'almadi:playtime-rewards';

export const playtimeRewards: PlaytimeReward[] = [
  { id: 'two-minutes', label: '2 минуты в игре', secondsRequired: 120, amount: 7000 },
  { id: 'five-minutes', label: '5 минут в игре', secondsRequired: 300, amount: 15000 },
  { id: 'ten-minutes', label: '10 минут в игре', secondsRequired: 600, amount: 35000 },
  { id: 'twenty-minutes', label: '20 минут в игре', secondsRequired: 1200, amount: 80000 },
];

export const loadPlaytimeRewardState = (now = new Date()): PlaytimeRewardState => {
  return normalizeState(readState(), toDateKey(now));
};

export const addPlaytimeSecond = (state: PlaytimeRewardState, now = new Date()) => {
  const current = normalizeState(state, toDateKey(now));
  const nextState = { ...current, secondsPlayed: current.secondsPlayed + 1 };
  savePlaytimeRewardState(nextState);
  return nextState;
};

export const getPlaytimeRewardStatuses = (state: PlaytimeRewardState): PlaytimeRewardStatus[] => {
  return playtimeRewards.map((reward) => {
    const claimed = state.claimedIds.includes(reward.id);
    const remainingSeconds = Math.max(0, reward.secondsRequired - state.secondsPlayed);
    return {
      ...reward,
      available: !claimed && remainingSeconds === 0,
      claimed,
      remainingSeconds,
    };
  });
};

export const claimPlaytimeReward = (state: PlaytimeRewardState, id: PlaytimeRewardId, now = new Date()) => {
  const current = normalizeState(state, toDateKey(now));
  const reward = playtimeRewards.find((item) => item.id === id);
  if (!reward || current.claimedIds.includes(id) || current.secondsPlayed < reward.secondsRequired) return null;

  const nextState = { ...current, claimedIds: [...current.claimedIds, id] };
  savePlaytimeRewardState(nextState);
  return { amount: reward.amount, label: reward.label, state: nextState };
};

const savePlaytimeRewardState = (state: PlaytimeRewardState) => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const normalizeState = (state: Partial<PlaytimeRewardState> | null, dateKey: string): PlaytimeRewardState => {
  if (!state || state.dateKey !== dateKey) {
    return { dateKey, secondsPlayed: 0, claimedIds: [] };
  }

  return {
    dateKey,
    secondsPlayed: normalizeSeconds(state.secondsPlayed),
    claimedIds: normalizeClaimedIds(state.claimedIds),
  };
};

const normalizeSeconds = (value: number | undefined) => {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
};

const normalizeClaimedIds = (value: PlaytimeRewardId[] | undefined) => {
  if (!Array.isArray(value)) return [];
  return value.filter((id) => playtimeRewards.some((reward) => reward.id === id));
};

const readState = () => {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as Partial<PlaytimeRewardState>) : null;
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
