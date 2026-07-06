import { buildings } from './gameData';
import { addCityXp, getXpForBuilding } from './cityLevel';
import { getRandomBuildingPoint, isZoneBuilding } from './cityBuildingPlacement';
import type { BuildingId, CityStats } from './gameTypes';

const MAX_HAPPINESS = 92;
const MAX_SAFETY = 92;
const MAX_TRUST = 90;

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const clampHappiness = (value: number) => Math.max(0, Math.min(MAX_HAPPINESS, Math.round(value)));
const clampSafety = (value: number) => Math.max(0, Math.min(MAX_SAFETY, Math.round(value)));
const clampTrust = (value: number) => Math.max(0, Math.min(MAX_TRUST, Math.round(value)));
const changeHappiness = (current: number, delta: number) => {
  const speed = delta > 0 ? 0.65 : 0.32;
  return clampHappiness(current + delta * speed);
};

export const startBuild = (stats: CityStats, id: BuildingId): CityStats => {
  const item = buildings.find((building) => building.id === id);
  if (!item || stats.money < item.cost) return stats;

  const next = { ...stats, money: stats.money - item.cost };
  if (item.buildSeconds <= 0) return completeBuilding(next, id);

  return {
    ...next,
    news: [`Строительство началось: ${item.name}.`, ...next.news].slice(0, 7),
    construction: [
      ...next.construction,
      {
        id: `${id}-${Date.now()}-${Math.random()}`,
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
  const item = buildings.find((building) => building.id === id);
  const currentCount = Number.isFinite(stats.buildings[id]) ? stats.buildings[id] : 0;
  const next = {
    ...stats,
    buildings: { ...stats.buildings, [id]: currentCount + 1 },
  };
  if (isZoneBuilding(id)) return addConstructionNews(applyLevelProgress(applyBuildingEffect(next, id), id), item?.name);

  const currentPositions = stats.buildingPositions[id] ?? [];
  const nextPosition = getRandomBuildingPoint(stats, id, currentCount);
  const placed = {
    ...next,
    buildingPositions: {
      ...stats.buildingPositions,
      [id]: [...currentPositions, nextPosition],
    },
  };
  return addConstructionNews(applyLevelProgress(applyBuildingEffect(placed, id), id), item?.name);
};

const applyBuildingEffect = (stats: CityStats, id: BuildingId): CityStats => {
  const effects: Record<BuildingId, Partial<CityStats>> = {
    homes: { population: stats.population + 60, happiness: changeHappiness(stats.happiness, 2) },
    schools: { happiness: changeHappiness(stats.happiness, 4), trust: clampTrust(stats.trust + 4) },
    hospitals: { health: clamp(stats.health + 8), trust: clampTrust(stats.trust + 2) },
    police: { safety: clampSafety(stats.safety + 8), trust: clampTrust(stats.trust + 1) },
    fireStations: { safety: clampSafety(stats.safety + 5), trust: clampTrust(stats.trust + 2) },
    parks: { happiness: changeHappiness(stats.happiness, 6), health: clamp(stats.health + 2) },
    factories: { health: clamp(stats.health - 3), happiness: changeHappiness(stats.happiness, -0.4) },
    shops: { happiness: changeHappiness(stats.happiness, 1), trust: clampTrust(stats.trust + 1) },
    malls: { happiness: changeHappiness(stats.happiness, 3), trust: clampTrust(stats.trust + 1) },
    airports: { trust: clampTrust(stats.trust + 5), happiness: changeHappiness(stats.happiness, 2) },
    stations: { population: stats.population + 120, trust: clampTrust(stats.trust + 2) },
    militaryBases: { safety: clampSafety(stats.safety + 10), trust: clampTrust(stats.trust + 3) },
    stadiums: { happiness: changeHappiness(stats.happiness, 8), trust: clampTrust(stats.trust + 3) },
    universities: { trust: clampTrust(stats.trust + 8), happiness: changeHappiness(stats.happiness, 4) },
    banks: { trust: clampTrust(stats.trust + 4), happiness: changeHappiness(stats.happiness, 2) },
    ports: { population: stats.population + 180, trust: clampTrust(stats.trust + 4) },
    museums: { happiness: changeHappiness(stats.happiness, 7), trust: clampTrust(stats.trust + 5) },
  };
  return { ...stats, ...effects[id] };
};

const applyLevelProgress = (stats: CityStats, id: BuildingId): CityStats => {
  const result = addCityXp(stats, getXpForBuilding(id));
  if (result.rewards.length === 0) return result.stats;
  const rewardNews = result.rewards.map((level) => `Город достиг ${level} уровня и получил $10000.`);
  return { ...result.stats, news: [...rewardNews, ...stats.news].slice(0, 7) };
};

const addConstructionNews = (stats: CityStats, name = 'объект'): CityStats => ({
  ...stats,
  news: [`Стройка завершена: ${name}.`, ...stats.news].slice(0, 7),
});
