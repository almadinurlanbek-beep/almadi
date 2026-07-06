import { getRandomBuildingPoint, isZoneBuilding } from './cityBuildingPlacement';
import type { BuildingId, CityStats } from './gameTypes';

export type Quest = {
  id: string;
  title: string;
  description: string;
  reward: number;
  rewardBuildingId?: BuildingId;
  rewardBuildingName?: string;
  target: number;
  getProgress: (stats: CityStats) => number;
};

export type QuestStatus = Quest & {
  claimed: boolean;
  completed: boolean;
  progress: number;
};

export const quests: Quest[] = [
  {
    id: 'first-neighborhood',
    title: 'Первый район',
    description: 'Построй 5 домов',
    reward: 25000,
    target: 5,
    getProgress: (stats) => stats.buildings.homes,
  },
  {
    id: 'safe-streets',
    title: 'Безопасные улицы',
    description: 'Подними безопасность до 70%',
    reward: 30000,
    target: 70,
    getProgress: (stats) => stats.safety,
  },
  {
    id: 'university-dream',
    title: 'Университетский город',
    description: 'Построй 5 школ',
    reward: 45000,
    rewardBuildingId: 'universities',
    rewardBuildingName: 'Университет',
    target: 5,
    getProgress: (stats) => stats.buildings.schools,
  },
  {
    id: 'green-city',
    title: 'Зелёный город',
    description: 'Построй 3 парка',
    reward: 30000,
    target: 3,
    getProgress: (stats) => stats.buildings.parks,
  },
  {
    id: 'business-center',
    title: 'Бизнес-центр',
    description: 'Построй 10 магазинов',
    reward: 60000,
    rewardBuildingId: 'banks',
    rewardBuildingName: 'Банк',
    target: 10,
    getProgress: (stats) => stats.buildings.shops,
  },
  {
    id: 'big-city',
    title: 'Большой город',
    description: 'Доведи население до 3000',
    reward: 85000,
    rewardBuildingId: 'stadiums',
    rewardBuildingName: 'Стадион',
    target: 3000,
    getProgress: (stats) => stats.population,
  },
  {
    id: 'sea-gate',
    title: 'Морские ворота',
    description: 'Построй 2 аэропорта и 2 вокзала',
    reward: 120000,
    rewardBuildingId: 'ports',
    rewardBuildingName: 'Порт с кораблями',
    target: 4,
    getProgress: (stats) => Math.min(2, stats.buildings.airports) + Math.min(2, stats.buildings.stations),
  },
  {
    id: 'culture-capital',
    title: 'Культурная столица',
    description: 'Доведи доверие до 65%',
    reward: 35000,
    rewardBuildingId: 'museums',
    rewardBuildingName: 'Музей',
    target: 65,
    getProgress: (stats) => stats.trust,
  },
];

export const getQuestStatuses = (stats: CityStats): QuestStatus[] => {
  return quests.map((quest) => {
    const progress = Math.min(quest.target, quest.getProgress(stats));
    const claimed = stats.claimedQuestIds.includes(quest.id);
    return {
      ...quest,
      claimed,
      completed: progress >= quest.target,
      progress,
    };
  });
};

export const claimQuestReward = (stats: CityStats, questId: string): CityStats => {
  const quest = quests.find((item) => item.id === questId);
  if (!quest || stats.claimedQuestIds.includes(questId) || quest.getProgress(stats) < quest.target) return stats;
  const withBuilding = quest.rewardBuildingId ? grantQuestBuilding(stats, quest.rewardBuildingId) : stats;

  return {
    ...withBuilding,
    money: withBuilding.money + quest.reward,
    claimedQuestIds: [...withBuilding.claimedQuestIds, questId],
    news: [getQuestNews(quest), ...withBuilding.news].slice(0, 7),
  };
};

const grantQuestBuilding = (stats: CityStats, buildingId: BuildingId): CityStats => {
  const currentCount = stats.buildings[buildingId];
  const next = {
    ...stats,
    buildings: { ...stats.buildings, [buildingId]: currentCount + 1 },
  };
  if (isZoneBuilding(buildingId)) return next;
  return {
    ...next,
    buildingPositions: {
      ...next.buildingPositions,
      [buildingId]: [...(next.buildingPositions[buildingId] ?? []), getRandomBuildingPoint(next, buildingId, currentCount)],
    },
  };
};

const getQuestNews = (quest: Quest) => {
  const money = `+$${quest.reward.toLocaleString('ru-RU')}`;
  const building = quest.rewardBuildingName ? ` и редкое здание: ${quest.rewardBuildingName}` : '';
  return `Квест выполнен: ${quest.title}, ${money}${building}.`;
};
