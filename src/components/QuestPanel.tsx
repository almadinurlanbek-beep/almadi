import { getAiQuestProgress, type AiQuest } from '../lib/aiQuests';
import { formatMoney } from '../lib/format';
import { getHourlyQuestStatuses, getNextHourlyQuestText, type HourlyQuestStatus } from '../lib/hourlyQuests';
import { getQuestStatuses, type QuestStatus } from '../lib/quests';
import type { CityStats } from '../lib/gameTypes';
import { useLanguage } from '../lib/i18n';

type Props = {
  aiQuest: AiQuest | null;
  aiQuestLoading: boolean;
  selectedQuestId: string | null;
  stats: CityStats;
  onClaimAiQuest: () => void;
  onClaimHourlyQuest: (questId: string) => void;
  onClaim: (questId: string) => void;
  onGenerateAiQuest: () => void;
};

type QuestCard = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  rewardBuildingName?: string;
};

export function QuestPanel({ aiQuest, aiQuestLoading, selectedQuestId, stats, onClaimAiQuest, onClaimHourlyQuest, onClaim, onGenerateAiQuest }: Props) {
  const { t } = useLanguage();
  const mayorQuests = getQuestStatuses(stats).filter((quest) => !quest.claimed);
  const hourlyQuests = getHourlyQuestStatuses(stats);
  const nextHourlyText = getNextHourlyQuestText(stats);
  const selected = getSelectedQuest(selectedQuestId, aiQuest, stats, mayorQuests, hourlyQuests);

  return (
    <section className="panel quest-panel">
      <div className="quest-heading">
        <div>
          <p className="eyebrow">{t('quests')}</p>
          <h3>{t('mapTasks')}</h3>
        </div>
        <button type="button" className="secondary" disabled={aiQuestLoading || Boolean(aiQuest)} onClick={onGenerateAiQuest}>
          {aiQuestLoading ? t('aiThinking') : aiQuest ? t('aiQuestExists') : t('aiTask')}
        </button>
      </div>
      {selected ? (
        <QuestCardView
          quest={selected.quest}
          kind={selected.kind}
          onClaim={() => {
            if (selected.kind === 'ai') onClaimAiQuest();
            if (selected.kind === 'hourly') onClaimHourlyQuest(selected.quest.id);
            if (selected.kind === 'mayor') onClaim(selected.quest.id);
          }}
          t={t}
        />
      ) : (
        <div className="quest-map-hint">
          <strong>{t('tapQuest')}</strong>
          <small>{t('questHint')}</small>
          {nextHourlyText && <small>Новые ежечасные квесты через {nextHourlyText}</small>}
        </div>
      )}
    </section>
  );
}

function QuestCardView({ quest, kind, onClaim, t }: { quest: QuestCard; kind: 'ai' | 'hourly' | 'mayor'; onClaim: () => void; t: ReturnType<typeof useLanguage>['t'] }) {
  return (
    <article className={`quest-item ${quest.completed ? 'ready' : ''} ${kind === 'ai' ? 'ai-quest' : ''} ${kind === 'hourly' ? 'hourly-quest' : ''}`}>
      <div>
        <small>{kind === 'ai' ? t('aiTask') : kind === 'hourly' ? t('quests') : t('mayorAdvice')}</small>
        <strong>{quest.title}</strong>
        <small>{quest.description}</small>
        <div className="quest-progress">
          <span style={{ width: `${Math.round((quest.progress / quest.target) * 100)}%` }} />
        </div>
        <small>
          {quest.progress}/{quest.target} · {formatMoney(quest.reward)}
          {quest.rewardBuildingName ? ` + ${quest.rewardBuildingName}` : ''}
        </small>
      </div>
      <button type="button" className={quest.completed ? 'dark' : 'secondary'} disabled={!quest.completed} onClick={onClaim}>
        {t('claim')}
      </button>
    </article>
  );
}

const getSelectedQuest = (
  selectedQuestId: string | null,
  aiQuest: AiQuest | null,
  stats: CityStats,
  mayorQuests: QuestStatus[],
  hourlyQuests: HourlyQuestStatus[],
) => {
  if (!selectedQuestId) return null;
  if (aiQuest?.id === selectedQuestId) {
    const progress = getAiQuestProgress(aiQuest, stats);
    return { kind: 'ai' as const, quest: { ...aiQuest, progress, completed: progress >= aiQuest.target } };
  }
  const hourly = hourlyQuests.find((quest) => quest.id === selectedQuestId);
  if (hourly) return { kind: 'hourly' as const, quest: hourly };
  const mayor = mayorQuests.find((quest) => quest.id === selectedQuestId);
  if (mayor) return { kind: 'mayor' as const, quest: mayor };
  return null;
};
