import { getPlaytimeRewardStatuses, type PlaytimeRewardId, type PlaytimeRewardState } from '../lib/playtimeRewards';
import { formatMoney } from '../lib/format';
import { useLanguage } from '../lib/i18n';

type Props = {
  reward: PlaytimeRewardState;
  onClaim: (id: PlaytimeRewardId) => void;
};

export function PlaytimeRewardPanel({ reward, onClaim }: Props) {
  const { t } = useLanguage();
  const statuses = getPlaytimeRewardStatuses(reward);

  return (
    <section className="panel playtime-reward">
      <div className="reward-heading">
        <div>
          <p className="eyebrow">{t('freeRewards')}</p>
          <h3>{t('playtime')}</h3>
        </div>
        <strong>{formatDuration(reward.secondsPlayed)}</strong>
      </div>
      <div className="playtime-list">
        {statuses.map((status) => (
          <button
            type="button"
            className={status.available ? 'dark' : 'secondary'}
            disabled={!status.available}
            key={status.id}
            onClick={() => onClaim(status.id)}
          >
            <span>{status.label}</span>
            <small>{getButtonText(status.claimed, status.remainingSeconds, status.amount, t)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

const getButtonText = (claimed: boolean, remainingSeconds: number, amount: number, t: ReturnType<typeof useLanguage>['t']) => {
  if (claimed) return t('claimed');
  if (remainingSeconds > 0) return `${t('after')} ${formatDuration(remainingSeconds)}`;
  return `${t('claim')} ${formatMoney(amount)}`;
};

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
