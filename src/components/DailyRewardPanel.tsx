import { getDailyRewardStatus, type DailyRewardState } from '../lib/dailyRewards';
import { formatMoney } from '../lib/format';
import { useLanguage } from '../lib/i18n';

type Props = {
  reward: DailyRewardState;
  onClaim: () => void;
};

export function DailyRewardPanel({ reward, onClaim }: Props) {
  const { t } = useLanguage();
  const status = getDailyRewardStatus(reward);
  const streakText = status.streak > 0 ? `${status.streak} ${t('streak')}` : t('startStreak');

  return (
    <section className="panel daily-reward">
      <div>
        <p className="eyebrow">{t('dailyReward')}</p>
        <strong>{formatMoney(status.amount)}</strong>
        <small>{t('day')} {status.day} {t('dayOf')} - {streakText}</small>
        <span className="daily-streak">{t('streak')}: {status.streak}</span>
      </div>
      <button type="button" className={status.available ? 'dark' : 'secondary'} disabled={!status.available} onClick={onClaim}>
        {status.available ? t('claim') : t('alreadyClaimed')}
      </button>
    </section>
  );
}
