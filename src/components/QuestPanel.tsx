import type { AiQuest } from '../lib/aiQuests';
import { formatMoney } from '../lib/format';
import { getHourlyQuestStatuses, getNextHourlyQuestText } from '../lib/hourlyQuests';
import { getSelectedQuest, type SelectedQuestCard } from '../lib/questSelection';
import { translateQuest } from '../lib/questTranslations';
import { getQuestStatuses } from '../lib/quests';
import type { CityStats } from '../lib/gameTypes';
import { useLanguage, type Language } from '../lib/i18n';

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

export function QuestPanel({ aiQuest, aiQuestLoading, selectedQuestId, stats, onClaimAiQuest, onClaimHourlyQuest, onClaim, onGenerateAiQuest }: Props) {
  const { language, t } = useLanguage();
  const mayorQuests = getQuestStatuses(stats).filter((quest) => !quest.claimed);
  const hourlyQuests = getHourlyQuestStatuses(stats);
  const nextHourlyText = getNextHourlyQuestText(stats);
  const selected = getSelectedQuest(selectedQuestId, aiQuest, stats, mayorQuests, hourlyQuests);
  const translatedSelected = selected ? { ...selected, quest: translateQuest(selected.quest, selected.kind, language) } : null;
  const text = questPanelText[language];

  return (
    <section className="panel quest-panel" id="quest-panel">
      <div className="quest-heading">
        <div>
          <p className="eyebrow">{t('quests')}</p>
          <h3>{t('mapTasks')}</h3>
        </div>
        <button type="button" className="secondary" disabled={aiQuestLoading || Boolean(aiQuest)} onClick={onGenerateAiQuest}>
          {aiQuestLoading ? t('aiThinking') : aiQuest ? t('aiQuestExists') : t('aiTask')}
        </button>
      </div>
      {translatedSelected ? (
        <QuestCardView
          quest={translatedSelected.quest}
          kind={translatedSelected.kind}
          onClaim={() => {
            if (translatedSelected.kind === 'ai') onClaimAiQuest();
            if (translatedSelected.kind === 'hourly') onClaimHourlyQuest(translatedSelected.quest.id);
            if (translatedSelected.kind === 'mayor') onClaim(translatedSelected.quest.id);
          }}
          t={t}
        />
      ) : (
        <div className="quest-map-hint">
          <strong>{t('tapQuest')}</strong>
          <small>{t('questHint')}</small>
          {nextHourlyText && <small>{text.nextHourly} {nextHourlyText}</small>}
        </div>
      )}
    </section>
  );
}

function QuestCardView({ quest, kind, onClaim, t }: { quest: SelectedQuestCard; kind: 'ai' | 'hourly' | 'mayor'; onClaim: () => void; t: ReturnType<typeof useLanguage>['t'] }) {
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

const questPanelText: Record<Language, { nextHourly: string }> = {
  en: { nextHourly: 'New hourly quests in' },
  ru: { nextHourly: 'Новые ежечасные квесты через' },
  kk: { nextHourly: 'Жаңа сағаттық квесттер' },
};
