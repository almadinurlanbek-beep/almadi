import { formatMoney } from '../lib/format';
import { useLanguage, type Language } from '../lib/i18n';
import type { SelectedQuest } from '../lib/questSelection';
import { translateQuest } from '../lib/questTranslations';

type Props = {
  selected: SelectedQuest;
  onClaim: () => void;
  onClose: () => void;
};

export function QuestRewardModal({ selected, onClaim, onClose }: Props) {
  const { language } = useLanguage();
  const text = questRewardText[language];
  const quest = translateQuest(selected.quest, selected.kind, language);
  const progressPercent = Math.round((quest.progress / quest.target) * 100);

  return (
    <div className="quest-reward-backdrop" role="presentation" onClick={onClose}>
      <section className="quest-reward-modal" role="dialog" aria-modal="true" aria-labelledby="quest-reward-title" onClick={(event) => event.stopPropagation()}>
        <div className="quest-reward-head">
          <div>
            <p className="eyebrow">{text.kind[selected.kind]}</p>
            <h2 id="quest-reward-title">{quest.title}</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            {text.close}
          </button>
        </div>
        <p>{quest.description}</p>
        <div className="quest-reward-progress">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <small>
          {quest.progress}/{quest.target} · {text.reward} {formatMoney(quest.reward)}
          {quest.rewardBuildingName ? ` + ${quest.rewardBuildingName}` : ''}
        </small>
        <button type="button" className={quest.completed ? 'dark' : 'secondary'} disabled={!quest.completed} onClick={onClaim}>
          {quest.completed ? text.claim : text.notReady}
        </button>
      </section>
    </div>
  );
}

const questRewardText: Record<Language, {
  claim: string;
  close: string;
  kind: Record<SelectedQuest['kind'], string>;
  notReady: string;
  reward: string;
}> = {
  en: {
    claim: 'Claim reward',
    close: 'Close',
    kind: { ai: 'AI quest', hourly: 'Hourly quest', mayor: 'Mayor quest' },
    notReady: 'Reward is not ready yet',
    reward: 'reward',
  },
  ru: {
    claim: 'Забрать награду',
    close: 'Закрыть',
    kind: { ai: 'ИИ-квест', hourly: 'Ежечасный квест', mayor: 'Квест мэра' },
    notReady: 'Награда ещё не готова',
    reward: 'награда',
  },
  kk: {
    claim: 'Сыйлықты алу',
    close: 'Жабу',
    kind: { ai: 'AI-квест', hourly: 'Сағаттық квест', mayor: 'Әкім квесті' },
    notReady: 'Сыйлық әлі дайын емес',
    reward: 'сыйлық',
  },
};
