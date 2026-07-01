import { countries } from '../lib/countries';
import type { CityStats } from '../lib/gameTypes';

type Props = {
  stats: CityStats;
  onCountryChange: (countryId: string) => void;
};

export function CountryPanel({ stats, onCountryChange }: Props) {
  return (
    <section className="panel country-panel">
      <label>
        <span className="eyebrow">Страна</span>
        <select value={stats.countryId} onChange={(event) => onCountryChange(event.target.value)}>
          {countries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <div>
        <small>Население страны</small>
        <strong>{stats.countryPopulation.toLocaleString('ru-RU')}</strong>
      </div>
    </section>
  );
}
