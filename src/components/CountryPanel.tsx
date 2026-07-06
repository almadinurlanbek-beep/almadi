import { countries } from '../lib/countries';
import type { CityStats } from '../lib/gameTypes';
import { useLanguage } from '../lib/i18n';

type Props = {
  stats: CityStats;
  onCountryChange: (countryId: string) => void;
};

export function CountryPanel({ stats, onCountryChange }: Props) {
  const { t } = useLanguage();
  return (
    <section className="panel country-panel">
      <label>
        <span className="eyebrow">{t('country')}</span>
        <select value={stats.countryId} onChange={(event) => onCountryChange(event.target.value)}>
          {countries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <div>
        <small>{t('countryPopulation')}</small>
        <strong>{stats.countryPopulation.toLocaleString('ru-RU')}</strong>
      </div>
    </section>
  );
}
