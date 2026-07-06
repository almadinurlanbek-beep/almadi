import type { CityStats, HourlyQuest, HourlyQuestObjective } from './gameTypes';

const HOUR_MS = 60 * 60 * 1000;

type ObjectiveConfig = {
  max?: number;
  progress: (stats: CityStats) => number;
};

const objectives: Record<HourlyQuestObjective, ObjectiveConfig> = {
  population: { progress: (stats) => stats.population },
  happiness: { max: 92, progress: (stats) => stats.happiness },
  health: { max: 100, progress: (stats) => stats.health },
  safety: { max: 92, progress: (stats) => stats.safety },
  trust: { max: 90, progress: (stats) => stats.trust },
  homes: { progress: (stats) => stats.buildings.homes },
  schools: { progress: (stats) => stats.buildings.schools },
  parks: { progress: (stats) => stats.buildings.parks },
  shops: { progress: (stats) => stats.buildings.shops },
};

const templates: Record<HourlyQuestObjective, { title: string; description: (target: number) => string; reward: number }> = {
  population: { title: 'Рост района', description: (target) => `Доведи население до ${target}`, reward: 28000 },
  happiness: { title: 'Довольные жители', description: (target) => `Подними счастье до ${target}%`, reward: 24000 },
  health: { title: 'Здоровый город', description: (target) => `Подними здоровье до ${target}%`, reward: 24000 },
  safety: { title: 'Спокойные улицы', description: (target) => `Подними безопасность до ${target}%`, reward: 26000 },
  trust: { title: 'Доверие мэру', description: (target) => `Подними доверие до ${target}%`, reward: 26000 },
  homes: { title: 'Новые дома', description: (target) => `Построй ${target} домов`, reward: 22000 },
  schools: { title: 'Школьный квартал', description: (target) => `Построй ${target} школ`, reward: 30000 },
  parks: { title: 'Больше зелени', description: (target) => `Построй ${target} парков`, reward: 26000 },
  shops: { title: 'Местный бизнес', description: (target) => `Построй ${target} магазинов`, reward: 26000 },
};

export type HourlyQuestStatus = HourlyQuest & {
  completed: boolean;
  progress: number;
};

export const ensureHourlyQuests = (stats: CityStats, now = Date.now()): CityStats => {
  if (stats.hourlyQuests.length > 0) return stats;
  if (stats.nextHourlyQuestAt !== null && stats.nextHourlyQuestAt > now) return stats;
  return {
    ...stats,
    hourlyQuests: createHourlyQuests(stats, now),
    nextHourlyQuestAt: null,
  };
};

export const getHourlyQuestStatuses = (stats: CityStats): HourlyQuestStatus[] => {
  return stats.hourlyQuests.map((quest) => {
    const progress = Math.min(quest.target, objectives[quest.objective].progress(stats));
    return { ...quest, completed: progress >= quest.target, progress };
  });
};

export const claimHourlyQuestReward = (stats: CityStats, questId: string, now = Date.now()): CityStats => {
  const status = getHourlyQuestStatuses(stats).find((quest) => quest.id === questId);
  if (!status?.completed) return stats;

  const remaining = stats.hourlyQuests.filter((quest) => quest.id !== questId);
  return {
    ...stats,
    money: stats.money + status.reward,
    hourlyQuests: remaining,
    nextHourlyQuestAt: remaining.length === 0 ? now + HOUR_MS : stats.nextHourlyQuestAt,
    news: [`Ежечасный квест выполнен: ${status.title}, +$${status.reward.toLocaleString('ru-RU')}.`, ...stats.news].slice(0, 7),
  };
};

export const getNextHourlyQuestText = (stats: CityStats, now = Date.now()) => {
  if (stats.hourlyQuests.length > 0 || stats.nextHourlyQuestAt === null) return null;
  const seconds = Math.max(0, Math.ceil((stats.nextHourlyQuestAt - now) / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes <= 0) return `${rest} сек.`;
  return `${minutes} мин. ${rest.toString().padStart(2, '0')} сек.`;
};

const createHourlyQuests = (stats: CityStats, now: number) => {
  return getAvailableObjectives(stats)
    .sort((a, b) => getSeededRank(a, now) - getSeededRank(b, now))
    .slice(0, 3)
    .map((objective, index) => createQuest(stats, objective, now, index));
};

const createQuest = (stats: CityStats, objective: HourlyQuestObjective, now: number, index: number): HourlyQuest => {
  const current = objectives[objective].progress(stats);
  const target = getTarget(objective, current);
  const template = templates[objective];
  return {
    id: `hourly-${now}-${index}-${objective}`,
    title: template.title,
    description: template.description(target),
    objective,
    target,
    reward: template.reward + index * 4000,
  };
};

const getTarget = (objective: HourlyQuestObjective, current: number) => {
  if (objective === 'population') return current + 180;
  const next = current + (['homes', 'schools', 'parks', 'shops'].includes(objective) ? 2 : 8);
  const max = objectives[objective].max;
  return max === undefined ? next : Math.min(max, next);
};

const getAvailableObjectives = (stats: CityStats) => {
  return (Object.keys(objectives) as HourlyQuestObjective[]).filter((objective) => {
    const item = objectives[objective];
    return item.max === undefined || item.progress(stats) < item.max;
  });
};

const getSeededRank = (objective: HourlyQuestObjective, now: number) => {
  const seed = Math.floor(now / HOUR_MS);
  return (objective.charCodeAt(0) * 17 + objective.length * 31 + seed) % 97;
};
