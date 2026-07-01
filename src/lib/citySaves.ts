import { createInitialCity, initialCity } from './gameData';
import type { CityStats } from './gameTypes';

const citiesKey = 'almadi:cities';
const countryKey = 'almadi:country';

export const loadSavedCities = () => {
  const savedCities = readJson<Record<string, CityStats>>(citiesKey);
  const cities = savedCities && Object.keys(savedCities).length > 0
    ? savedCities
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
