import { repairBuildingPositions } from './cityBuildingPlacement';
import { normalizeHourlyQuests, normalizeSkins } from './citySaveNormalize';
import { createInitialCity, emptyBuildings, firstPayoutGraceSeconds, initialCity, moneyGrantAmount, moneyGrantVersion, startingMoney } from './gameData';
import { supabase } from './supabase';
import type { CityStats } from './gameTypes';

const citiesKey = 'almadi:cities';
const countryKey = 'almadi:country';

type SavedCities = { countryId: string; cities: Record<string, CityStats> };
type CitySaveRow = { country_id: string; cities: unknown };

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

export const loadUserSavedCities = async (): Promise<SavedCities | null> => {
  const { data, error } = await supabase.from('city_saves').select('country_id,cities').maybeSingle<CitySaveRow>();

  if (error) throw error;
  return data ? normalizeSavedRow(data) : null;
};

export const loadFriendSavedCities = async (userId: string): Promise<SavedCities | null> => {
  const { data, error } = await supabase
    .from('city_saves')
    .select('country_id,cities')
    .eq('user_id', userId)
    .maybeSingle<CitySaveRow>();

  if (error) throw error;
  return data ? normalizeSavedRow(data) : null;
};

export const saveUserCities = async (countryId: string, cities: Record<string, CityStats>) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session?.user.id;
  if (!userId) return;

  const { error } = await supabase.from('city_saves').upsert({
    user_id: userId,
    country_id: countryId,
    cities,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
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

  const savedGrantVersion = normalizeNumber(saved.moneyGrantVersion, 0);
  const baseMoney = isFreshCity(saved, buildings)
    ? Math.max(normalizeNumber(saved.money, startingMoney), startingMoney)
    : normalizeNumber(saved.money, startingMoney);
  const money = baseMoney + (savedGrantVersion >= moneyGrantVersion ? 0 : moneyGrantAmount);

  return repairBuildingPositions({
    ...base,
    ...saved,
    countryId,
    money,
    moneyGrantVersion,
    level: normalizeNumber(saved.level, base.level),
    xp: normalizeNumber(saved.xp, base.xp),
    residentPayoutSeconds: isFreshCity(saved, buildings)
      ? Math.max(normalizeNumber(saved.residentPayoutSeconds, firstPayoutGraceSeconds), firstPayoutGraceSeconds)
      : normalizeNumber(saved.residentPayoutSeconds, base.residentPayoutSeconds),
    buildings,
    buildingSkins: normalizeSkins(saved.buildingSkins),
    buildingPositions: saved.buildingPositions ?? {},
    construction: Array.isArray(saved.construction) ? saved.construction : [],
    incidentResponses: Array.isArray(saved.incidentResponses) ? saved.incidentResponses : [],
    claimedQuestIds: Array.isArray(saved.claimedQuestIds) ? saved.claimedQuestIds.filter((id) => typeof id === 'string') : [],
    hourlyQuests: normalizeHourlyQuests(saved.hourlyQuests),
    nextHourlyQuestAt: normalizeOptionalNumber(saved.nextHourlyQuestAt),
    news: Array.isArray(saved.news) ? saved.news : [],
    activeIncident: saved.activeIncident ?? null,
  });
};

const normalizeCount = (value: number | undefined) => (Number.isFinite(value) ? value ?? 0 : 0);
const normalizeNumber = (value: number | undefined, fallback: number) => (Number.isFinite(value) ? value ?? fallback : fallback);
const normalizeOptionalNumber = (value: number | null | undefined) => (Number.isFinite(value) ? value ?? null : null);
const isFreshCity = (city: Partial<CityStats>, buildings: CityStats['buildings']) => {
  const noBuildings = Object.values(buildings).every((count) => count === 0);
  const noConstruction = !city.construction || city.construction.length === 0;
  return (city.day ?? 1) === 1 && noBuildings && noConstruction;
};

export const saveCities = (countryId: string, cities: Record<string, CityStats>) => {
  localStorage.setItem(countryKey, countryId);
  localStorage.setItem(citiesKey, JSON.stringify(cities));
};

const isCityRecord = (value: unknown): value is Record<string, Partial<CityStats> | null> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const normalizeSavedRow = (data: CitySaveRow): SavedCities => {
  const savedCities = isCityRecord(data.cities) ? data.cities : {};
  const cities = Object.keys(savedCities).length > 0
    ? normalizeCities(savedCities)
    : { [initialCity.countryId]: initialCity };
  const countryId = data.country_id || initialCity.countryId;

  return {
    countryId,
    cities: {
      ...cities,
      [countryId]: cities[countryId] ?? createInitialCity(countryId),
    },
  };
};

const readJson = <T>(key: string) => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
};
