import type { CityStats } from './gameTypes';
import type { Language } from './i18n';
import { supabase } from './supabase';

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
  news: [`AI quest completed: ${quest.title}, +$${quest.reward.toLocaleString('ru-RU')}.`, ...stats.news].slice(0, 7),
});

export const generateAiQuest = async (stats: CityStats, language: Language): Promise<AiQuest> => {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      system: getAiQuestSystem(language, stats),
      prompt: buildPrompt(stats, language),
    },
  });

  if (error || (isRecord(data) && typeof data.error === 'string')) {
    return createFallbackAiQuest(stats, language);
  }

  try {
    return normalizeAiQuest(parseAiText(data), stats);
  } catch {
    return createFallbackAiQuest(stats, language);
  }
};

const buildPrompt = (stats: CityStats, language: Language) => {
  const labels = promptLabels[language];
  return [
    `${labels.day}: ${stats.day}`,
    `${labels.money}: ${stats.money}`,
    `${labels.population}: ${stats.population}`,
    `${labels.happiness}: ${stats.happiness}`,
    `${labels.health}: ${stats.health}`,
    `${labels.safety}: ${stats.safety}`,
    `${labels.trust}: ${stats.trust}`,
    `${labels.homes}: ${stats.buildings.homes}`,
    `${labels.schools}: ${stats.buildings.schools}`,
    `${labels.hospitals}: ${stats.buildings.hospitals}`,
    `${labels.police}: ${stats.buildings.police}`,
    `${labels.fireStations}: ${stats.buildings.fireStations}`,
    `${labels.parks}: ${stats.buildings.parks}`,
    `${labels.factories}: ${stats.buildings.factories}`,
    `${labels.shops}: ${stats.buildings.shops}`,
    `${labels.malls}: ${stats.buildings.malls}`,
    `${labels.airports}: ${stats.buildings.airports}`,
    `${labels.stations}: ${stats.buildings.stations}`,
    'Format: {"title":"Trade boost","description":"Build 4 malls","objective":"malls","target":4,"reward":60000}',
  ].join('\n');
};

const parseAiText = (data: unknown): AiQuestResponse => {
  if (!isRecord(data) || typeof data.text !== 'string') throw new Error('AI did not return quest text.');
  const match = data.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI did not return JSON.');
  const parsed: unknown = JSON.parse(match[0]);
  if (!isRecord(parsed)) throw new Error('AI returned invalid JSON.');
  return parsed;
};

const normalizeAiQuest = (quest: AiQuestResponse, stats: CityStats): AiQuest => {
  if (typeof quest.title !== 'string' || typeof quest.description !== 'string') throw new Error('Quest text is missing.');
  if (!isAiQuestObjective(quest.objective)) throw new Error('Unknown quest objective.');
  if (typeof quest.target !== 'number' || typeof quest.reward !== 'number') throw new Error('Quest numbers are missing.');

  const objective = objectives[quest.objective];
  const currentProgress = objective.progress(stats);
  if (objective.max !== undefined && currentProgress >= objective.max) throw new Error('Objective is already maxed.');
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

const createFallbackAiQuest = (stats: CityStats, language: Language): AiQuest => {
  const objective = pickFallbackObjective(stats);
  const current = objectives[objective].progress(stats);
  const target = getFallbackTarget(objective, current);

  return {
    id: `ai-fallback-${Date.now()}`,
    title: fallbackTitles[language][objective],
    description: getFallbackDescription(objective, target, language),
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
    airports: 2,
    factories: 3,
    fireStations: 3,
    homes: 6,
    hospitals: 3,
    malls: 4,
    police: 3,
    population: 250,
    schools: 4,
    shops: 5,
    stations: 2,
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

const getFallbackDescription = (objective: AiQuestObjective, target: number, language: Language) => {
  if (objective === 'population') return fallbackPopulationText[language](target);
  if (buildingNames[language][objective]) return fallbackBuildText[language](target, buildingNames[language][objective]);
  return fallbackStatText[language](target);
};

const getAvailableObjectives = (stats: CityStats) => {
  return (Object.keys(objectives) as AiQuestObjective[]).filter((objective) => {
    const item = objectives[objective];
    return item.max === undefined || item.progress(stats) < item.max;
  });
};

const getAiQuestSystem = (language: Language, stats: CityStats) => {
  const languageName = { en: 'English', ru: 'Russian', kk: 'Kazakh' }[language];
  return [
    'Create short varied quests for a city-building game.',
    `Answer only in ${languageName}.`,
    'Return only JSON without markdown.',
    'This is a quest with a numeric target and reward, not mayor advice.',
    'Do not write generic recommendations. Write a concrete player goal.',
    `Choose objective strictly from: ${getAvailableObjectives(stats).join(', ')}.`,
    'Prefer building goals: shops, malls, airports, stations, hospitals, police, fireStations, schools, parks, homes, factories.',
    'target must be higher than the current value. Examples: shops 5, malls 4, airports 2, hospitals 3.',
    'reward must be from 15000 to 120000.',
  ].join(' ');
};

const isAiQuestObjective = (value: unknown): value is AiQuestObjective => {
  return typeof value === 'string' && value in objectives;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const promptLabels: Record<Language, Record<string, string>> = {
  en: {
    airports: 'Airports',
    day: 'Day',
    factories: 'Factories',
    fireStations: 'Fire stations',
    happiness: 'Happiness',
    health: 'Health',
    homes: 'Homes',
    hospitals: 'Hospitals',
    malls: 'Malls',
    money: 'Money',
    parks: 'Parks',
    police: 'Police',
    population: 'Population',
    safety: 'Safety',
    schools: 'Schools',
    shops: 'Shops',
    stations: 'Stations',
    trust: 'Trust',
  },
  ru: {
    airports: 'Аэропорты',
    day: 'День',
    factories: 'Заводы',
    fireStations: 'Пожарные',
    happiness: 'Счастье',
    health: 'Здоровье',
    homes: 'Дома',
    hospitals: 'Больницы',
    malls: 'ТЦ',
    money: 'Деньги',
    parks: 'Парки',
    police: 'Полиция',
    population: 'Население',
    safety: 'Безопасность',
    schools: 'Школы',
    shops: 'Магазины',
    stations: 'Вокзалы',
    trust: 'Доверие',
  },
  kk: {
    airports: 'Әуежайлар',
    day: 'Күн',
    factories: 'Зауыттар',
    fireStations: 'Өрт сөндіру бөлімдері',
    happiness: 'Бақыт',
    health: 'Денсаулық',
    homes: 'Үйлер',
    hospitals: 'Ауруханалар',
    malls: 'СОО',
    money: 'Ақша',
    parks: 'Саябақтар',
    police: 'Полиция',
    population: 'Халық',
    safety: 'Қауіпсіздік',
    schools: 'Мектептер',
    shops: 'Дүкендер',
    stations: 'Вокзалдар',
    trust: 'Сенім',
  },
};

const fallbackTitles: Record<Language, Record<AiQuestObjective, string>> = {
  en: {
    airports: 'Air gateway',
    factories: 'Industry boost',
    fireStations: 'Fire protection',
    happiness: 'Happy residents',
    health: 'Healthy district',
    homes: 'New blocks',
    hospitals: 'Medical network',
    malls: 'Big shopping',
    parks: 'Green route',
    police: 'Safe city',
    population: 'City growth plan',
    safety: 'Calm streets',
    schools: 'School district',
    shops: 'Shopping street',
    stations: 'Transport hub',
    trust: 'Mayor trust',
  },
  ru: {
    airports: 'Воздушные ворота',
    factories: 'Промышленный рывок',
    fireStations: 'Пожарная защита',
    happiness: 'Довольные жители',
    health: 'Здоровый район',
    homes: 'Новые кварталы',
    hospitals: 'Медицинская сеть',
    malls: 'Большой шопинг',
    parks: 'Зелёный маршрут',
    police: 'Безопасный город',
    population: 'План роста города',
    safety: 'Спокойные улицы',
    schools: 'Школьный район',
    shops: 'Торговая улица',
    stations: 'Транспортный узел',
    trust: 'Доверие к мэру',
  },
  kk: {
    airports: 'Әуе қақпасы',
    factories: 'Өнеркәсіп серпіні',
    fireStations: 'Өрттен қорғау',
    happiness: 'Риза тұрғындар',
    health: 'Дені сау аудан',
    homes: 'Жаңа кварталдар',
    hospitals: 'Медициналық желі',
    malls: 'Үлкен сауда',
    parks: 'Жасыл бағыт',
    police: 'Қауіпсіз қала',
    population: 'Қала өсу жоспары',
    safety: 'Тыныш көшелер',
    schools: 'Мектеп ауданы',
    shops: 'Сауда көшесі',
    stations: 'Көлік торабы',
    trust: 'Әкімге сенім',
  },
};

const buildingNames: Record<Language, Partial<Record<AiQuestObjective, string>>> = {
  en: {
    airports: 'airports',
    factories: 'factories',
    fireStations: 'fire stations',
    homes: 'homes',
    hospitals: 'hospitals',
    malls: 'malls',
    parks: 'parks',
    police: 'police stations',
    schools: 'schools',
    shops: 'shops',
    stations: 'stations',
  },
  ru: {
    airports: 'аэропортов',
    factories: 'заводов',
    fireStations: 'пожарных частей',
    homes: 'домов',
    hospitals: 'больниц',
    malls: 'ТЦ',
    parks: 'парков',
    police: 'полицейских участков',
    schools: 'школ',
    shops: 'магазинов',
    stations: 'вокзалов',
  },
  kk: {
    airports: 'әуежай',
    factories: 'зауыт',
    fireStations: 'өрт сөндіру бөлімі',
    homes: 'үй',
    hospitals: 'аурухана',
    malls: 'СОО',
    parks: 'саябақ',
    police: 'полиция бөлімі',
    schools: 'мектеп',
    shops: 'дүкен',
    stations: 'вокзал',
  },
};

const fallbackBuildText: Record<Language, (target: number, name: string) => string> = {
  en: (target, name) => `Build ${target} ${name}`,
  ru: (target, name) => `Построй ${target} ${name}`,
  kk: (target, name) => `${target} ${name} сал`,
};

const fallbackPopulationText: Record<Language, (target: number) => string> = {
  en: (target) => `Reach ${target} population`,
  ru: (target) => `Доведи население до ${target}`,
  kk: (target) => `Халық санын ${target}-ға жеткіз`,
};

const fallbackStatText: Record<Language, (target: number) => string> = {
  en: (target) => `Raise the stat to ${target}%`,
  ru: (target) => `Подними показатель до ${target}%`,
  kk: (target) => `Көрсеткішті ${target}%-ға жеткіз`,
};
