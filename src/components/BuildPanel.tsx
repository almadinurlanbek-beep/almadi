import { buildings } from '../lib/gameData';
import { formatMoney } from '../lib/format';
import type { BuildingId, CityStats } from '../lib/gameTypes';

type Props = {
  stats: CityStats;
  onBuild: (id: BuildingId) => void;
};

export function BuildPanel({ stats, onBuild }: Props) {
  return (
    <section className="panel">
      <p className="eyebrow">Строительство</p>
      <div className="build-grid">
        {buildings.map((building) => {
          const jobs = stats.construction.filter((job) => job.buildingId === building.id);
          return (
            <article className="build-card" key={building.id}>
              <div className="build-title">
                <span>{building.icon}</span>
                <div>
                  <h3>{building.name}</h3>
                  <small>{building.description}</small>
                  {jobs.map((job) => (
                    <small className="build-timer" key={job.id}>
                      Строится: {formatDuration(job.remainingSeconds)}
                    </small>
                  ))}
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

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} сек.`;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
};
