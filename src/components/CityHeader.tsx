import { getXpForNextLevel } from '../lib/cityLevel';
import { getCountry } from '../lib/countries';
import { getTaxIncome } from '../lib/economy';
import { formatMoney } from '../lib/format';
import { formatTime } from '../lib/gameLogic';
import { languageOptions, useLanguage, type Language } from '../lib/i18n';
import { IncomeTooltip } from './IncomeTooltip';
import type { CityStats } from '../lib/gameTypes';

type Props = {
  friendCount: number;
  onOpenFriends: () => void;
  onOpenSettings: () => void;
  stats: CityStats;
};

export function CityHeader({ friendCount, onOpenFriends, onOpenSettings, stats }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const country = getCountry(stats.countryId);
  const countryName = countryNames[language][country.id] ?? country.name;
  const level = stats.level ?? 1;
  const xp = stats.xp ?? 0;
  const items = [
    ['⭐', t('level'), `${level} (${xp}/${getXpForNextLevel(level)})`],
    ['💰', t('money'), formatMoney(stats.money)],
    ['🏙️', t('city'), stats.population],
    ['🌍', countryName, stats.countryPopulation.toLocaleString(language === 'en' ? 'en-US' : 'ru-RU')],
    ['😊', t('happiness'), `${stats.happiness}%`],
    ['🚓', t('safety'), `${stats.safety}%`],
    ['🛡️', t('trust'), `${stats.trust}%`],
    ['📈', t('taxesDay'), formatMoney(getTaxIncome(stats))],
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
          <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
            {languageOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <button type="button" className="friend-top-button" onClick={onOpenFriends}>
          {t('addFriend')}
          {friendCount > 0 && <span>{friendCount}</span>}
        </button>
        <button type="button" className="settings-button" onClick={onOpenSettings} aria-label={settingsLabel[language]}>
          ⚙️
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

const settingsLabel: Record<Language, string> = {
  en: 'Open settings',
  ru: 'Открыть настройки',
  kk: 'Баптауларды ашу',
};

const countryNames: Record<Language, Record<string, string>> = {
  en: {
    australia: 'Australia',
    brazil: 'Brazil',
    canada: 'Canada',
    china: 'China',
    egypt: 'Egypt',
    france: 'France',
    germany: 'Germany',
    india: 'India',
    japan: 'Japan',
    kazakhstan: 'Kazakhstan',
    norway: 'Norway',
    russia: 'Russia',
    uae: 'UAE',
    usa: 'USA',
    uzbekistan: 'Uzbekistan',
  },
  ru: {
    australia: 'Австралия',
    brazil: 'Бразилия',
    canada: 'Канада',
    china: 'Китай',
    egypt: 'Египет',
    france: 'Франция',
    germany: 'Германия',
    india: 'Индия',
    japan: 'Япония',
    kazakhstan: 'Казахстан',
    norway: 'Норвегия',
    russia: 'Россия',
    uae: 'ОАЭ',
    usa: 'США',
    uzbekistan: 'Узбекистан',
  },
  kk: {
    australia: 'Аустралия',
    brazil: 'Бразилия',
    canada: 'Канада',
    china: 'Қытай',
    egypt: 'Мысыр',
    france: 'Франция',
    germany: 'Германия',
    india: 'Үндістан',
    japan: 'Жапония',
    kazakhstan: 'Қазақстан',
    norway: 'Норвегия',
    russia: 'Ресей',
    uae: 'БАӘ',
    usa: 'АҚШ',
    uzbekistan: 'Өзбекстан',
  },
};
