import { buildings } from '../lib/gameData';
import { formatMoney } from '../lib/format';
import type { BuildingId, CityStats } from '../lib/gameTypes';

type Props = {
  stats: CityStats;
  onBuild: (id: BuildingId) => void;
  onAddMoney: () => void;
};

export function BuildPanel({ stats, onBuild, onAddMoney }: Props) {
  return (
    <section className="panel">
      <p className="eyebrow">Строительство</p>
      <button type="button" className="dark cheat-button" onClick={onAddMoney}>
        +10 миллионов
      </button>
      <div className="build-grid">
        {buildings.map((building) => (
          <article className="build-card" key={building.id}>
            <div className="build-title">
              <span>{building.icon}</span>
              <div>
                <h3>{building.name}</h3>
                <small>{building.description}</small>
              </div>
            </div>
            <button type="button" className="secondary" disabled={stats.money < building.cost} onClick={() => onBuild(building.id)}>
              {formatMoney(building.cost)}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
