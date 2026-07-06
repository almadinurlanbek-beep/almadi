import { getXpForNextLevel } from '../lib/cityLevel';
import { getCountry } from '../lib/countries';
import { getTaxIncome } from '../lib/economy';
import { formatMoney } from '../lib/format';
import { formatTime } from '../lib/gameLogic';
import { languageOptions, useLanguage } from '../lib/i18n';
import { IncomeTooltip } from './IncomeTooltip';
import type { CityStats } from '../lib/gameTypes';

type Props = {
  friendCount: number;
  onOpenFriends: () => void;
  stats: CityStats;
};

export function CityHeader({ friendCount, onOpenFriends, stats }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const country = getCountry(stats.countryId);
  const level = stats.level ?? 1;
  const xp = stats.xp ?? 0;
  const items = [
    ['LV', t('level'), `${level} (${xp}/${getXpForNextLevel(level)})`],
    ['$', t('money'), formatMoney(stats.money)],
    ['POP', t('city'), stats.population],
    ['GEO', country.name, stats.countryPopulation.toLocaleString('ru-RU')],
    ['+', t('happiness'), `${stats.happiness}%`],
    ['!', t('safety'), `${stats.safety}%`],
    ['*', t('trust'), `${stats.trust}%`],
    ['%', t('taxesDay'), formatMoney(getTaxIncome(stats))],
  ];

  return (
    <header className="top">
      <div className="top-heading">
        <div>
          <p className="eyebrow">{t('day')} {stats.day} - {formatTime(stats.minuteOfDay)}</p>
          <h1>City Mayor Simulator</h1>
        </div>
      </div>
      <div className="top-actions">
        <label className="language-select">
          <span>{t('language')}</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
            {languageOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <button type="button" className="friend-top-button" onClick={onOpenFriends}>
          {t('addFriend')}
          {friendCount > 0 && <span>{friendCount}</span>}
        </button>
      </div>
      <div className="metrics">
        {items.map(([icon, label, value]) => (
          <article className="metric" key={label}>
            <span>{icon}</span>
            <div>
              <small>{label}</small>
              <strong className={label === t('money') ? 'money-value' : undefined}>
                {value}
                {label === t('money') && <IncomeTooltip stats={stats} />}
              </strong>
            </div>
          </article>
        ))}
      </div>
    </header>
  );
}
