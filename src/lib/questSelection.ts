import { getAiQuestProgress, type AiQuest } from './aiQuests';
import type { CityStats } from './gameTypes';
import type { HourlyQuestStatus } from './hourlyQuests';
import type { QuestStatus } from './quests';

export type SelectedQuestKind = 'ai' | 'hourly' | 'mayor';

export type SelectedQuestCard = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  rewardBuildingName?: string;
};

export type SelectedQuest = {
  kind: SelectedQuestKind;
  quest: SelectedQuestCard;
};

export const getSelectedQuest = (
  selectedQuestId: string | null,
  aiQuest: AiQuest | null,
  stats: CityStats,
  mayorQuests: QuestStatus[],
  hourlyQuests: HourlyQuestStatus[],
): SelectedQuest | null => {
  if (!selectedQuestId) return null;
  if (aiQuest?.id === selectedQuestId) {
    const progress = getAiQuestProgress(aiQuest, stats);
    return { kind: 'ai', quest: { ...aiQuest, progress, completed: progress >= aiQuest.target } };
  }
  const hourly = hourlyQuests.find((quest) => quest.id === selectedQuestId);
  if (hourly) return { kind: 'hourly', quest: hourly };
  const mayor = mayorQuests.find((quest) => quest.id === selectedQuestId);
  if (mayor) return { kind: 'mayor', quest: mayor };
  return null;
};
