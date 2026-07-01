import { repairBuildingPositions } from './cityBuildingPlacement';
import { createInitialCity, emptyBuildings, initialCity } from './gameData';
import type { CityStats } from './gameTypes';

const citiesKey = 'almadi:cities';
const countryKey = 'almadi:country';

export const loadSavedCities = () => {
  const savedCities = readJson<Record<string, Partial<CityStats>>>(citiesKey);
  const cities = savedCities && Object.keys(savedCities).length > 0
    ? normalizeCities(savedCities)
    : { [initialCity.countryId]: initialCity };
  const countryId = localStorage.getItem(countryKey) ?? initialCity.countryId;

  return {
    countryId,
    cities: {
      ...cities,
      [countryId]: cities[countryId] ?? createInitialCity(countryId),
    },
  };
};

const normalizeCities = (cities: Record<string, Partial<CityStats> | null>) => {
  return Object.fromEntries(
    Object.entries(cities).map(([countryId, city]) => [countryId, normalizeCity(countryId, city)]),
  ) as Record<string, CityStats>;
};

const normalizeCity = (countryId: string, city: Partial<CityStats> | null): CityStats => {
  const saved = city ?? {};
  const base = createInitialCity(countryId);
  const buildings = Object.fromEntries(
    Object.keys(emptyBuildings).map((key) => {
      const buildingId = key as keyof typeof emptyBuildings;
      return [buildingId, normalizeCount(saved.buildings?.[buildingId])];
    }),
  ) as CityStats['buildings'];

  return repairBuildingPositions({
    ...base,
    ...saved,
    countryId,
    level: normalizeNumber(saved.level, base.level),
    xp: normalizeNumber(saved.xp, base.xp),
    buildings,
    buildingPositions: saved.buildingPositions ?? {},
    construction: Array.isArray(saved.construction) ? saved.construction : [],
    incidentResponses: Array.isArray(saved.incidentResponses) ? saved.incidentResponses : [],
    news: Array.isArray(saved.news) ? saved.news : [],
    activeIncident: saved.activeIncident ?? null,
  });
};

const normalizeCount = (value: number | undefined) => (Number.isFinite(value) ? value ?? 0 : 0);
const normalizeNumber = (value: number | undefined, fallback: number) => (Number.isFinite(value) ? value ?? fallback : fallback);

export const saveCities = (countryId: string, cities: Record<string, CityStats>) => {
  localStorage.setItem(countryKey, countryId);
  localStorage.setItem(citiesKey, JSON.stringify(cities));
};

const readJson = <T>(key: string) => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
};
