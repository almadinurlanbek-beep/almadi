import { buildings } from '../lib/gameData';
import { formatMoney } from '../lib/format';
import { getBuildingText, useLanguage } from '../lib/i18n';
import type { BuildingId, CityStats } from '../lib/gameTypes';

type Props = {
  stats: CityStats;
  onBuild: (id: BuildingId) => void;
};

export function BuildPanel({ stats, onBuild }: Props) {
  const { language, t } = useLanguage();
  return (
    <section className="panel build-panel">
      <p className="eyebrow">{t('construction')}</p>
      <div className="build-grid">
        {buildings.map((building) => {
          const text = getBuildingText(building.id, language);
          return (
            <article className="build-card" key={building.id}>
              <div className="build-title">
                <span>{building.icon}</span>
                <div>
                  <h3>{text?.name ?? building.name}</h3>
                  <small>{text?.description ?? building.description}</small>
                </div>
              </div>
              <button type="button" className="secondary" disabled={stats.money < building.cost} onClick={() => onBuild(building.id)}>
                {formatMoney(building.cost)}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
