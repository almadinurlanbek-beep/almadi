import { buildings } from '../lib/gameData';
import { formatMoney } from '../lib/format';
import { getXpForBuilding } from '../lib/cityLevel';
import { getBuildingText, useLanguage, type Language } from '../lib/i18n';
import type { BuildingId, CityStats } from '../lib/gameTypes';

type Props = {
  stats: CityStats;
  onBuild: (id: BuildingId) => void;
};

export function BuildPanel({ stats, onBuild }: Props) {
  const { language, t } = useLanguage();
  const text = buildPanelText[language];
  return (
    <section className="panel build-panel" id="build-panel">
      <p className="eyebrow">{t('construction')}</p>
      <div className="build-grid">
        {buildings.map((building) => {
          const buildingText = getBuildingText(building.id, language);
          return (
            <article className="build-card" key={building.id}>
              <div className="build-title">
                <span>{building.icon}</span>
                <div>
                  <h3>{buildingText?.name ?? building.name}</h3>
                  <small>{buildingText?.description ?? building.description}</small>
                  <small className="build-xp">+{getXpForBuilding(building.id)} {text.xp}</small>
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

const buildPanelText: Record<Language, { xp: string }> = {
  en: { xp: 'XP' },
  ru: { xp: 'опыта' },
  kk: { xp: 'тәжірибе' },
};
