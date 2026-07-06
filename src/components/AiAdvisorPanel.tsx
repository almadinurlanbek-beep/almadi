import { useState } from 'react';
import { generateAiQuest, getAiQuestProgress, type AiQuest } from '../lib/aiQuests';
import type { CityStats } from '../lib/gameTypes';

type Props = {
  stats: CityStats;
  activeQuest: AiQuest | null;
  onQuestReady: (quest: AiQuest) => void;
};

export function AiAdvisorPanel({ stats, activeQuest, onQuestReady }: Props) {
  const [advice, setAdvice] = useState('Нажми кнопку, и советник даст задание с прогрессом.');
  const [loading, setLoading] = useState(false);
  const activeProgress = activeQuest ? getAiQuestProgress(activeQuest, stats) : 0;
  const isActiveQuestDone = activeQuest ? activeProgress >= activeQuest.target : false;
  const buttonDisabled = loading || Boolean(activeQuest);
  const shownAdvice = activeQuest ? getQuestAdvice(activeQuest, stats) : advice;

  const handleAsk = async () => {
    if (activeQuest) return;

    setLoading(true);
    try {
      const quest = await generateAiQuest(stats);
      onQuestReady(quest);
      setAdvice(getQuestAdvice(quest, stats));
    } catch {
      setAdvice('Советник сейчас не смог создать задание. Попробуй ещё раз через пару секунд.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel ai-advisor">
      <div className="advisor-heading">
        <div>
          <p className="eyebrow">ИИ-советник</p>
          <h3>Совет мэра</h3>
        </div>
        <button type="button" className="secondary" disabled={buttonDisabled} onClick={handleAsk}>
          {getButtonText(loading, activeQuest, isActiveQuestDone)}
        </button>
      </div>
      <p>{shownAdvice}</p>
    </section>
  );
}

const getButtonText = (loading: boolean, activeQuest: AiQuest | null, isActiveQuestDone: boolean) => {
  if (loading) return 'Думает...';
  if (!activeQuest) return 'Спросить';
  return isActiveQuestDone ? 'Забери награду' : 'Выполни задание';
};

const getQuestAdvice = (quest: AiQuest, stats: CityStats) => {
  const progress = getAiQuestProgress(quest, stats);
  if (progress >= quest.target) {
    return `Готово: ${quest.description}. У тебя уже ${progress}/${quest.target}. Забери награду в квестах, потом можно спросить новый совет.`;
  }
  return `Нельзя получить новый совет, пока это задание не выполнено: ${quest.description}. Сейчас ${progress}/${quest.target}.`;
};
