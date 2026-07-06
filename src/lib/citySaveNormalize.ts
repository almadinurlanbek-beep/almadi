import { defaultBuildingSkins } from './buildingSkins';
import { emptyBuildings } from './gameData';
import type { BuildingSkinId, CityStats, HourlyQuest, HourlyQuestObjective } from './gameTypes';

const hourlyObjectives: HourlyQuestObjective[] = ['population', 'happiness', 'health', 'safety', 'trust', 'homes', 'schools', 'parks', 'shops'];

export const normalizeSkins = (skins: Partial<CityStats['buildingSkins']> | undefined) => {
  const allowed: BuildingSkinId[] = ['classic', 'modern', 'gold'];
  return Object.fromEntries(
    Object.keys(emptyBuildings).map((key) => {
      const buildingId = key as keyof typeof emptyBuildings;
      const skin = skins?.[buildingId];
      return [buildingId, skin && allowed.includes(skin) ? skin : defaultBuildingSkins[buildingId]];
    }),
  ) as CityStats['buildingSkins'];
};

export const normalizeHourlyQuests = (quests: HourlyQuest[] | undefined) => {
  return Array.isArray(quests) ? quests.filter(isHourlyQuest) : [];
};

const isHourlyQuest = (quest: HourlyQuest): quest is HourlyQuest => {
  return typeof quest.id === 'string'
    && typeof quest.title === 'string'
    && typeof quest.description === 'string'
    && hourlyObjectives.includes(quest.objective)
    && typeof quest.target === 'number'
    && typeof quest.reward === 'number';
};
