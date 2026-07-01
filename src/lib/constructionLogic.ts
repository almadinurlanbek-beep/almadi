import { buildings } from './gameData';
import type { BuildingId, CityStats } from './gameTypes';

const MAX_HAPPINESS = 92;
const MAX_SAFETY = 92;
const MAX_TRUST = 90;

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const clampHappiness = (value: number) => Math.max(0, Math.min(MAX_HAPPINESS, Math.round(value)));
const clampSafety = (value: number) => Math.max(0, Math.min(MAX_SAFETY, Math.round(value)));
const clampTrust = (value: number) => Math.max(0, Math.min(MAX_TRUST, Math.round(value)));
const changeHappiness = (current: number, delta: number) => {
  const speed = delta > 0 ? 0.65 : 1.7;
  return clampHappiness(current + delta * speed);
};

export const startBuild = (stats: CityStats, id: BuildingId): CityStats => {
  const item = buildings.find((building) => building.id === id);
  if (!item || stats.money < item.cost) return stats;

  const next = { ...stats, money: stats.money - item.cost };
  if (item.buildSeconds <= 0) return completeBuilding(next, id);

  return {
    ...next,
    construction: [
      ...stats.construction,
      {
        id: `${Date.now()}-${Math.random()}`,
        buildingId: id,
        remainingSeconds: item.buildSeconds,
        totalSeconds: item.buildSeconds,
      },
    ],
  };
};

export const advanceConstruction = (stats: CityStats): CityStats => {
  if (stats.construction.length === 0) return stats;
  const updated = stats.construction.map((job) => ({ ...job, remainingSeconds: job.remainingSeconds - 1 }));
  const finished = updated.filter((job) => job.remainingSeconds <= 0);
  const active = updated.filter((job) => job.remainingSeconds > 0);
  return finished.reduce((current, job) => completeBuilding(current, job.buildingId), {
    ...stats,
    construction: active,
  });
};

const completeBuilding = (stats: CityStats, id: BuildingId): CityStats => {
  const next = {
    ...stats,
    buildings: { ...stats.buildings, [id]: stats.buildings[id] + 1 },
  };
  return applyBuildingEffect(next, id);
};

const applyBuildingEffect = (stats: CityStats, id: BuildingId): CityStats => {
  const effects: Record<BuildingId, Partial<CityStats>> = {
    homes: { population: stats.population + 60, happiness: changeHappiness(stats.happiness, 2) },
    schools: { happiness: changeHappiness(stats.happiness, 4), trust: clampTrust(stats.trust + 4) },
    hospitals: { health: clamp(stats.health + 8), trust: clampTrust(stats.trust + 2) },
    police: { safety: clampSafety(stats.safety + 8), trust: clampTrust(stats.trust + 1) },
    fireStations: { safety: clampSafety(stats.safety + 5), trust: clampTrust(stats.trust + 2) },
    parks: { happiness: changeHappiness(stats.happiness, 6), health: clamp(stats.health + 2) },
    factories: { health: clamp(stats.health - 3), happiness: changeHappiness(stats.happiness, -1) },
    shops: { happiness: changeHappiness(stats.happiness, 1), trust: clampTrust(stats.trust + 1) },
    malls: { happiness: changeHappiness(stats.happiness, 3), trust: clampTrust(stats.trust + 1) },
    airports: { trust: clampTrust(stats.trust + 5), happiness: changeHappiness(stats.happiness, 2) },
    stations: { population: stats.population + 120, trust: clampTrust(stats.trust + 2) },
  };
  return { ...stats, ...effects[id] };
};
