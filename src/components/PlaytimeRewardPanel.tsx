import { getPlaytimeRewardStatuses, type PlaytimeRewardId, type PlaytimeRewardState } from '../lib/playtimeRewards';
import { formatMoney } from '../lib/format';

type Props = {
  reward: PlaytimeRewardState;
  onClaim: (id: PlaytimeRewardId) => void;
};

export function PlaytimeRewardPanel({ reward, onClaim }: Props) {
  const statuses = getPlaytimeRewardStatuses(reward);

  return (
    <section className="panel playtime-reward">
      <div className="reward-heading">
        <div>
          <p className="eyebrow">Бесплатные награды</p>
          <h3>За время в игре</h3>
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
            <small>{getButtonText(status.claimed, status.remainingSeconds, status.amount)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

const getButtonText = (claimed: boolean, remainingSeconds: number, amount: number) => {
  if (claimed) return 'Забрано';
  if (remainingSeconds > 0) return `через ${formatDuration(remainingSeconds)}`;
  return `Забрать ${formatMoney(amount)}`;
};

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
