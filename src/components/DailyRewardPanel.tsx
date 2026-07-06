import { getDailyRewardStatus, type DailyRewardState } from '../lib/dailyRewards';
import { formatMoney } from '../lib/format';

type Props = {
  reward: DailyRewardState;
  onClaim: () => void;
};

export function DailyRewardPanel({ reward, onClaim }: Props) {
  const status = getDailyRewardStatus(reward);
  const streakText = status.streak > 0 ? `${status.streak} дн. подряд` : 'начни серию';

  return (
    <section className="panel daily-reward">
      <div>
        <p className="eyebrow">Ежедневная награда</p>
        <strong>{formatMoney(status.amount)}</strong>
        <small>День {status.day} из 7 - {streakText}</small>
        <span className="daily-streak">Винстрик дня: {status.streak}</span>
      </div>
      <button type="button" className={status.available ? 'dark' : 'secondary'} disabled={!status.available} onClick={onClaim}>
        {status.available ? 'Забрать' : 'Уже забрано'}
      </button>
    </section>
  );
}
