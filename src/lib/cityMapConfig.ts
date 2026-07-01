import type { BuildingId } from './gameTypes';
import type { TileKey, TileVariant } from './cityMap';

export const labels: Record<TileKey, string> = {
  shop: 'Магазин',
  lot: 'Пусто',
  park: 'Парк',
  home: 'Дом',
  road: 'Дорога',
  school: 'Школа',
  water: 'Река',
  hospital: 'Больница',
  police: 'Полиция',
  fire: 'Пожарная',
  mall: 'ТЦ',
  factory: 'Завод',
  airport: 'Аэропорт',
  station: 'Вокзал',
};

export const variants: Record<TileKey, TileVariant> = {
  shop: 'work',
  lot: 'lot',
  park: 'nature',
  home: 'home',
  road: 'road',
  school: 'service',
  water: 'water',
  hospital: 'service',
  police: 'service',
  fire: 'service',
  mall: 'work',
  factory: 'work',
  airport: 'work',
  station: 'work',
};

export const buildingMap: Record<Exclude<TileKey, 'lot' | 'road' | 'water'>, BuildingId> = {
  shop: 'shops',
  park: 'parks',
  home: 'homes',
  school: 'schools',
  hospital: 'hospitals',
  police: 'police',
  fire: 'fireStations',
  mall: 'malls',
  factory: 'factories',
  airport: 'airports',
  station: 'stations',
};

export const modelByBuilding: Record<BuildingId, TileKey> = {
  shops: 'shop',
  homes: 'home',
  schools: 'school',
  hospitals: 'hospital',
  police: 'police',
  fireStations: 'fire',
  parks: 'park',
  factories: 'factory',
  malls: 'mall',
  airports: 'airport',
  stations: 'station',
};
