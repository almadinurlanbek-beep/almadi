import { getXpForNextLevel } from '../lib/cityLevel';
import { getCountry } from '../lib/countries';
import { getTaxIncome } from '../lib/economy';
import { formatMoney } from '../lib/format';
import { formatTime } from '../lib/gameLogic';
import { IncomeTooltip } from './IncomeTooltip';
import type { CityStats } from '../lib/gameTypes';

type Props = {
  friendCount: number;
  onOpenFriends: () => void;
  stats: CityStats;
};

export function CityHeader({ friendCount, onOpenFriends, stats }: Props) {
  const country = getCountry(stats.countryId);
  const level = stats.level ?? 1;
  const xp = stats.xp ?? 0;
  const items = [
    ['LV', 'Уровень', `${level} (${xp}/${getXpForNextLevel(level)})`],
    ['$', 'Деньги', formatMoney(stats.money)],
    ['👥', 'Город', stats.population],
    ['🌍', country.name, stats.countryPopulation.toLocaleString('ru-RU')],
    ['😊', 'Счастье', `${stats.happiness}%`],
    ['🛡️', 'Безопасность', `${stats.safety}%`],
    ['⭐', 'Доверие', `${stats.trust}%`],
    ['📈', 'Налоги/день', formatMoney(getTaxIncome(stats))],
  ];

  return (
    <header className="top">
      <div className="top-heading">
        <div>
          <p className="eyebrow">День {stats.day} - {formatTime(stats.minuteOfDay)}</p>
          <h1>City Mayor Simulator</h1>
        </div>
      </div>
      <button type="button" className="friend-top-button" onClick={onOpenFriends}>
        Добавить друга
        {friendCount > 0 && <span>{friendCount}</span>}
      </button>
      <div className="metrics">
        {items.map(([icon, label, value]) => (
          <article className="metric" key={label}>
            <span>{icon}</span>
            <div>
              <small>{label}</small>
              <strong className={label === 'Деньги' ? 'money-value' : undefined}>
                {value}
                {label === 'Деньги' && <IncomeTooltip stats={stats} />}
              </strong>
            </div>
          </article>
        ))}
      </div>
    </header>
  );
}
