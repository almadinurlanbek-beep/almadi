import type { BuildingId, CityStats } from './gameTypes';
import { getAirportAnchor } from './cityAirportZone';
import { getBuildableTile } from './cityBuildableTile';
import { getMallAnchor } from './cityMallZone';
import { getParkAnchor } from './cityParkZone';
import { createBuildingTile, createPlacedLookup, subtractPlacedBuildings, type PlacedLookup } from './cityPlacedBuildings';
import { createServiceClearance } from './cityServiceClearance';
import { createSpecialZoneTile } from './citySpecialZones';
import { getStationAnchor } from './cityStationZone';
import { buildingMap, labels, modelByBuilding, variants } from './cityMapConfig';
export type TileKey =
  | 'lot'
  | 'park'
  | 'home'
  | 'road'
  | 'school'
  | 'water'
  | 'hospital'
  | 'police'
  | 'fire'
  | 'mall'
  | 'shop'
  | 'factory'
  | 'airport'
  | 'station';
export type TileVariant = 'lot' | 'road' | 'home' | 'service' | 'nature' | 'work' | 'water';
export type MapTile = {
  id: string;
  x: number;
  y: number;
  label: string;
  count?: number;
  buildingId?: BuildingId;
  buildingIndex?: number;
  model: TileKey;
  variant: TileVariant;
};
const MAP_SIZE = 80;
export const cityMapColumns = MAP_SIZE;
export const getCityTileCount = () => MAP_SIZE * MAP_SIZE;
export const isRoadCell = (x: number, y: number) => x % 10 === 2 || y % 10 === 4;
export const isWaterCell = (x: number, y: number) => (x === 35 || x === 36 || x === 37) && y % 10 !== 4;
export const getConstructionTile = (buildingId: BuildingId, index: number) => {
  if (buildingId === 'airports') return getBuildableTile(getAirportAnchor(index), isBlockedCell);
  if (buildingId === 'stations') return getBuildableTile(getStationAnchor(index), isBlockedCell);
  if (buildingId === 'parks') return getBuildableTile(getParkAnchor(index), isBlockedCell);
  if (buildingId === 'malls') return getBuildableTile(getMallAnchor(index), isBlockedCell);
  const target = modelByBuilding[buildingId];
  let matched = 0;
  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      if (isRoadCell(x, y) || isWaterCell(x, y) || getPlannedBuilding(x, y) !== target) continue;
      if (matched === index) return { x, y };
      matched += 1;
    }
  }
  return { x: 8 + index, y: 8 };
};
const isBlockedCell = (x: number, y: number) => isRoadCell(x, y) || isWaterCell(x, y);
export const createCityTiles = (stats: CityStats): MapTile[] => {
  const totals = { ...stats.buildings };
  const remaining = { ...stats.buildings };
  const placed = createPlacedLookup(stats.buildingPositions);
  subtractPlacedBuildings(remaining, stats.buildingPositions);
  const airportCount = stats.buildings.airports;
  const stationCount = stats.buildings.stations;
  const parkCount = stats.buildings.parks;
  const mallCount = stats.buildings.malls;
  const serviceClearance = createServiceClearance({
    counts: totals,
    positions: stats.buildingPositions,
    mapSize: MAP_SIZE,
    isBlocked: isBlockedCell,
    getPlannedModel: getPlannedBuilding,
  });
  return Array.from({ length: getCityTileCount() }, (_, index) => {
    const x = index % MAP_SIZE;
    const y = Math.floor(index / MAP_SIZE);
    return createTile(x, y, totals, remaining, placed, serviceClearance, airportCount, stationCount, parkCount, mallCount);
  });
};
const createTile = (
  x: number,
  y: number,
  totals: Record<BuildingId, number>,
  remaining: Record<BuildingId, number>,
  placed: PlacedLookup,
  serviceClearance: Set<string>,
  airportCount: number,
  stationCount: number,
  parkCount: number,
  mallCount: number,
): MapTile => {
  const placedBuilding = placed.get(`${x}-${y}`);
  if (placedBuilding) return createBuildingTile(x, y, placedBuilding.buildingId, placedBuilding.buildingIndex);
  const specialTile = createSpecialZoneTile(x, y, remaining, { airports: airportCount, stations: stationCount, parks: parkCount, malls: mallCount }, isBlockedCell);
  if (specialTile) return specialTile;
  const model = pickTileModel(x, y, remaining, serviceClearance);
  const buildingId = getBuildingId(model);
  const buildingIndex = buildingId ? totals[buildingId] - remaining[buildingId] : undefined;
  if (buildingId) remaining[buildingId] -= 1;
  return {
    id: `${x}-${y}`,
    x,
    y,
    label: labels[model],
    count: buildingId ? 1 : undefined,
    buildingId: buildingId ?? undefined,
    buildingIndex,
    model,
    variant: variants[model],
  };
};
const pickTileModel = (x: number, y: number, remaining: Record<BuildingId, number>, serviceClearance: Set<string>): TileKey => {
  if (isRoadCell(x, y)) return 'road';
  if (isWaterCell(x, y)) return 'water';
  const planned = getPlannedBuilding(x, y);
  if (planned === 'home' && serviceClearance.has(`${x}-${y}`)) return 'lot';
  const buildingId = getBuildingId(planned);
  return buildingId && remaining[buildingId] > 0 ? planned : 'lot';
};
const getPlannedBuilding = (x: number, y: number): TileKey => {
  const pattern = (x * 7 + y * 11) % 24;
  if (pattern < 9) return 'home';
  if (pattern < 12) return 'park';
  if (pattern < 14) return 'mall';
  if (pattern < 16) return 'factory';
  if (pattern === 16) return 'school';
  if (pattern === 17) return 'hospital';
  if (pattern === 18) return 'police';
  if (pattern === 19) return 'fire';
  if (pattern === 20) return 'station';
  if (pattern === 21) return 'airport';
  if (pattern === 22) return 'shop';
  return 'lot';
};
const getBuildingId = (model: TileKey) => {
  if (model === 'lot' || model === 'road' || model === 'water') return null;
  return buildingMap[model];
};
