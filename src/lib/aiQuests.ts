import { supabase } from './supabase';
import type { CityStats } from './gameTypes';

export type AiQuestObjective =
  | 'population'
  | 'happiness'
  | 'health'
  | 'safety'
  | 'trust'
  | 'homes'
  | 'schools'
  | 'hospitals'
  | 'police'
  | 'fireStations'
  | 'parks'
  | 'factories'
  | 'shops'
  | 'malls'
  | 'airports'
  | 'stations';

export type AiQuest = {
  id: string;
  title: string;
  description: string;
  objective: AiQuestObjective;
  target: number;
  reward: number;
};

type ObjectiveConfig = {
  max?: number;
  progress: (stats: CityStats) => number;
};

type AiQuestResponse = {
  title?: unknown;
  description?: unknown;
  objective?: unknown;
  target?: unknown;
  reward?: unknown;
};

const objectives: Record<AiQuestObjective, ObjectiveConfig> = {
  population: { progress: (stats) => stats.population },
  happiness: { max: 92, progress: (stats) => stats.happiness },
  health: { max: 100, progress: (stats) => stats.health },
  safety: { max: 92, progress: (stats) => stats.safety },
  trust: { max: 90, progress: (stats) => stats.trust },
  homes: { progress: (stats) => stats.buildings.homes },
  schools: { progress: (stats) => stats.buildings.schools },
  hospitals: { progress: (stats) => stats.buildings.hospitals },
  police: { progress: (stats) => stats.buildings.police },
  fireStations: { progress: (stats) => stats.buildings.fireStations },
  parks: { progress: (stats) => stats.buildings.parks },
  factories: { progress: (stats) => stats.buildings.factories },
  shops: { progress: (stats) => stats.buildings.shops },
  malls: { progress: (stats) => stats.buildings.malls },
  airports: { progress: (stats) => stats.buildings.airports },
  stations: { progress: (stats) => stats.buildings.stations },
};

const buildingObjectives: AiQuestObjective[] = [
  'shops',
  'malls',
  'airports',
  'stations',
  'hospitals',
  'police',
  'fireStations',
  'schools',
  'parks',
  'homes',
  'factories',
];

export const getAiQuestProgress = (quest: AiQuest, stats: CityStats) => {
  return Math.min(quest.target, objectives[quest.objective].progress(stats));
};

export const completeAiQuest = (stats: CityStats, quest: AiQuest): CityStats => ({
  ...stats,
  money: stats.money + quest.reward,
  news: [`ИИ-задание выполнено: ${quest.title}, +$${quest.reward.toLocaleString('ru-RU')}.`, ...stats.news].slice(0, 7),
});

export const generateAiQuest = async (stats: CityStats): Promise<AiQuest> => {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      system: [
        'Ты придумываешь короткие разные задания для игры про развитие города.',
        'Отвечай только JSON без markdown.',
        `objective выбери строго из: ${getAvailableObjectives(stats).join(', ')}.`,
        'Чаще выбирай строительные цели: shops, malls, airports, stations, hospitals, police, fireStations, schools, parks, homes, factories.',
        'target должен быть больше текущего значения. Примеры: shops 5, malls 4, airports 2, hospitals 3.',
        'reward от 15000 до 120000.',
      ].join(' '),
      prompt: buildPrompt(stats),
    },
  });

  if (error) {
    console.warn('AI quest fallback:', error.message);
    return createFallbackAiQuest(stats);
  }
  if (isRecord(data) && typeof data.error === 'string') {
    console.warn('AI quest fallback:', data.error);
    return createFallbackAiQuest(stats);
  }

  try {
    return normalizeAiQuest(parseAiText(data), stats);
  } catch (error) {
    console.warn('AI quest fallback:', error);
    return createFallbackAiQuest(stats);
  }
};

const buildPrompt = (stats: CityStats) => {
  return [
    `День: ${stats.day}`,
    `Деньги: ${stats.money}`,
    `Население: ${stats.population}`,
    `Счастье: ${stats.happiness}`,
    `Здоровье: ${stats.health}`,
    `Безопасность: ${stats.safety}`,
    `Доверие: ${stats.trust}`,
    `Дома: ${stats.buildings.homes}`,
    `Школы: ${stats.buildings.schools}`,
    `Больницы: ${stats.buildings.hospitals}`,
    `Полиция: ${stats.buildings.police}`,
    `Пожарные: ${stats.buildings.fireStations}`,
    `Парки: ${stats.buildings.parks}`,
    `Заводы: ${stats.buildings.factories}`,
    `Магазины: ${stats.buildings.shops}`,
    `ТЦ: ${stats.buildings.malls}`,
    `Аэропорты: ${stats.buildings.airports}`,
    `Вокзалы: ${stats.buildings.stations}`,
    'Формат: {"title":"Торговый рывок","description":"Построй 4 ТЦ","objective":"malls","target":4,"reward":60000}',
  ].join('\n');
};

const parseAiText = (data: unknown): AiQuestResponse => {
  if (!isRecord(data) || typeof data.text !== 'string') throw new Error('ИИ не вернул текст задания.');
  const match = data.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('ИИ вернул ответ не в формате JSON.');
  const parsed: unknown = JSON.parse(match[0]);
  if (!isRecord(parsed)) throw new Error('ИИ вернул неправильный JSON.');
  return parsed;
};

const normalizeAiQuest = (quest: AiQuestResponse, stats: CityStats): AiQuest => {
  if (typeof quest.title !== 'string' || typeof quest.description !== 'string') throw new Error('В задании нет названия или описания.');
  if (!isAiQuestObjective(quest.objective)) throw new Error('ИИ выбрал неизвестную цель.');
  if (typeof quest.target !== 'number' || typeof quest.reward !== 'number') throw new Error('В задании нет чисел цели или награды.');

  const objective = objectives[quest.objective];
  const currentProgress = objective.progress(stats);
  if (objective.max !== undefined && currentProgress >= objective.max) throw new Error('ИИ выбрал уже прокачанный показатель.');
  const target = Math.max(currentProgress + 1, Math.round(quest.target));

  return {
    id: `ai-${Date.now()}`,
    title: quest.title.slice(0, 42),
    description: quest.description.slice(0, 90),
    objective: quest.objective,
    target: objective.max === undefined ? target : Math.min(objective.max, target),
    reward: Math.min(120000, Math.max(15000, Math.round(quest.reward))),
  };
};

const createFallbackAiQuest = (stats: CityStats): AiQuest => {
  const objective = pickFallbackObjective(stats);
  const current = objectives[objective].progress(stats);
  const target = getFallbackTarget(objective, current);

  return {
    id: `ai-fallback-${Date.now()}`,
    title: getFallbackTitle(objective),
    description: getFallbackDescription(objective, target),
    objective,
    target,
    reward: getFallbackReward(objective),
  };
};

const pickFallbackObjective = (stats: CityStats): AiQuestObjective => {
  const available = getAvailableObjectives(stats);
  const availableBuildings = buildingObjectives.filter((objective) => available.includes(objective));
  if (availableBuildings.length > 0) {
    const seed = stats.day + stats.money + stats.population + Date.now();
    return availableBuildings[seed % availableBuildings.length];
  }
  return available[Date.now() % Math.max(1, available.length)] ?? 'population';
};

const getFallbackTarget = (objective: AiQuestObjective, current: number) => {
  const increments: Partial<Record<AiQuestObjective, number>> = {
    shops: 5,
    malls: 4,
    airports: 2,
    stations: 2,
    hospitals: 3,
    police: 3,
    fireStations: 3,
    schools: 4,
    parks: 4,
    homes: 6,
    factories: 3,
    population: 250,
  };
  if (objective === 'population') return current + (increments.population ?? 250);
  if (objective in increments) return current + (increments[objective] ?? 2);
  const max = objectives[objective].max ?? 100;
  return Math.min(max, current + 8);
};

const getFallbackReward = (objective: AiQuestObjective) => {
  if (objective === 'airports' || objective === 'malls') return 90000;
  if (objective === 'stations' || objective === 'hospitals') return 65000;
  if (buildingObjectives.includes(objective)) return 50000;
  return 45000;
};

const getFallbackTitle = (objective: AiQuestObjective) => {
  const titles: Record<AiQuestObjective, string> = {
    population: 'План роста города',
    happiness: 'Довольные жители',
    health: 'Здоровый район',
    safety: 'Спокойные улицы',
    trust: 'Доверие к мэру',
    homes: 'Новые кварталы',
    schools: 'Школьный район',
    hospitals: 'Медицинская сеть',
    police: 'Безопасный город',
    fireStations: 'Пожарная защита',
    parks: 'Зелёный маршрут',
    factories: 'Промышленный рывок',
    shops: 'Торговая улица',
    malls: 'Большой шопинг',
    airports: 'Воздушные ворота',
    stations: 'Транспортный узел',
  };
  return titles[objective];
};

const getFallbackDescription = (objective: AiQuestObjective, target: number) => {
  const buildingNames: Partial<Record<AiQuestObjective, string>> = {
    homes: 'домов',
    schools: 'школ',
    hospitals: 'больниц',
    police: 'полицейских участков',
    fireStations: 'пожарных частей',
    parks: 'парков',
    factories: 'заводов',
    shops: 'магазинов',
    malls: 'ТЦ',
    airports: 'аэропортов',
    stations: 'вокзалов',
  };
  if (objective === 'population') return `Доведи население до ${target}`;
  if (buildingNames[objective]) return `Построй ${target} ${buildingNames[objective]}`;
  return `Подними показатель до ${target}%`;
};

const getAvailableObjectives = (stats: CityStats) => {
  return (Object.keys(objectives) as AiQuestObjective[]).filter((objective) => {
    const item = objectives[objective];
    return item.max === undefined || item.progress(stats) < item.max;
  });
};

const isAiQuestObjective = (value: unknown): value is AiQuestObjective => {
  return typeof value === 'string' && value in objectives;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};
