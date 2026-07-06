import { useState } from 'react';
import { generateAiQuest, getAiQuestProgress, type AiQuest } from '../lib/aiQuests';
import type { CityStats } from '../lib/gameTypes';
import { useLanguage } from '../lib/i18n';

type Props = {
  stats: CityStats;
  activeQuest: AiQuest | null;
  onQuestReady: (quest: AiQuest) => void;
};

export function AiAdvisorPanel({ stats, activeQuest, onQuestReady }: Props) {
  const { t } = useLanguage();
  const [advice, setAdvice] = useState(t('advisorStart'));
  const [loading, setLoading] = useState(false);
  const activeProgress = activeQuest ? getAiQuestProgress(activeQuest, stats) : 0;
  const isActiveQuestDone = activeQuest ? activeProgress >= activeQuest.target : false;
  const buttonDisabled = loading || Boolean(activeQuest);
  const shownAdvice = activeQuest ? getQuestAdvice(activeQuest, stats, t) : advice;

  const handleAsk = async () => {
    if (activeQuest) return;

    setLoading(true);
    try {
      const quest = await generateAiQuest(stats);
      onQuestReady(quest);
      setAdvice(getQuestAdvice(quest, stats, t));
    } catch {
      setAdvice(t('advisorError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel ai-advisor">
      <div className="advisor-heading">
        <div>
          <p className="eyebrow">{t('advisorEyebrow')}</p>
          <h3>{t('mayorAdvice')}</h3>
        </div>
        <button type="button" className="secondary" disabled={buttonDisabled} onClick={handleAsk}>
          {getButtonText(loading, activeQuest, isActiveQuestDone, t)}
        </button>
      </div>
      <p>{shownAdvice}</p>
    </section>
  );
}

const getButtonText = (loading: boolean, activeQuest: AiQuest | null, isActiveQuestDone: boolean, t: ReturnType<typeof useLanguage>['t']) => {
  if (loading) return t('thinking');
  if (!activeQuest) return t('ask');
  return isActiveQuestDone ? t('claimReward') : t('completeTask');
};

const getQuestAdvice = (quest: AiQuest, stats: CityStats, t: ReturnType<typeof useLanguage>['t']) => {
  const progress = getAiQuestProgress(quest, stats);
  if (progress >= quest.target) {
    return `${t('claimReward')}: ${quest.description}. ${progress}/${quest.target}.`;
  }
  return `${t('completeTask')}: ${quest.description}. ${progress}/${quest.target}.`;
};
