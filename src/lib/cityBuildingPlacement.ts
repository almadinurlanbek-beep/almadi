import { getConstructionTile, isRoadCell, isWaterCell } from './cityMap';
import type { BuildingId, CityStats, TilePoint } from './gameTypes';

const mapSize = 80;
const zoneBuildingIds = new Set<BuildingId>(['airports', 'stations', 'parks', 'malls', 'militaryBases']);
const footprintRadiusByBuilding: Partial<Record<BuildingId, number>> = {
  hospitals: 2,
  police: 2,
  fireStations: 2,
  stadiums: 2,
  ports: 2,
  museums: 2,
  schools: 1,
  factories: 1,
  universities: 1,
  banks: 1,
};
const museumAnchors = [
  { x: 18, y: 15 },
  { x: 28, y: 15 },
  { x: 18, y: 25 },
  { x: 28, y: 25 },
  { x: 8, y: 15 },
  { x: 8, y: 25 },
  { x: 18, y: 35 },
  { x: 28, y: 35 },
];
const waterDirections = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
];

export const isZoneBuilding = (buildingId: BuildingId) => zoneBuildingIds.has(buildingId);

export const isBuildablePoint = (point: TilePoint) => {
  return Number.isInteger(point.x)
    && Number.isInteger(point.y)
    && point.x >= 0
    && point.x < mapSize
    && point.y >= 0
    && point.y < mapSize
    && !isRoadCell(point.x, point.y)
    && !isWaterCell(point.x, point.y);
};

export const repairBuildingPositions = (stats: CityStats): CityStats => {
  const occupied = new Set<string>();
  const buildingPositions: CityStats['buildingPositions'] = {};

  (Object.keys(stats.buildings) as BuildingId[]).forEach((buildingId) => {
    if (isZoneBuilding(buildingId)) return;
    const points = stats.buildingPositions[buildingId] ?? [];
    const visiblePoints = Array.from({ length: stats.buildings[buildingId] ?? 0 }, (_, index) => points[index]);
    buildingPositions[buildingId] = visiblePoints.map((point, index) => {
      const repaired = getSafeBuildingPoint(buildingId, index, point, occupied);
      addOccupiedCells(occupied, buildingId, repaired);
      return repaired;
    });
  });

  return { ...stats, buildingPositions };
};

export const getSafeBuildingPoint = (
  buildingId: BuildingId,
  index: number,
  point: TilePoint | null | undefined,
  occupied = new Set<string>(),
) => {
  const rounded = point ? { x: Math.round(point.x), y: Math.round(point.y), rotation: normalizeRotation(point.rotation) } : getConstructionTile(buildingId, index);
  if (buildingId === 'ports') return getSafePortPoint(index, rounded, occupied);
  if (buildingId === 'museums') return getSafeMuseumPoint(index, rounded, occupied);
  if (isRoadsideBuildablePoint(buildingId, rounded, occupied)) return withRoadRotation(buildingId, rounded);
  const fallback = getConstructionTile(buildingId, index);
  return findNearestRoadside(buildingId, fallback, occupied)
    ?? findNearestRoadside(buildingId, rounded, occupied)
    ?? findNearestBuildable(buildingId, fallback, occupied)
    ?? fallback;
};

export const getOccupiedBuildingCells = (positions: CityStats['buildingPositions'], except?: { buildingId: BuildingId; index: number }) => {
  const occupied = new Set<string>();
  (Object.entries(positions ?? {}) as [BuildingId, TilePoint[]][]).forEach(([buildingId, points]) => {
    points.forEach((point, index) => {
      if (except && except.buildingId === buildingId && except.index === index) return;
      addOccupiedCells(occupied, buildingId, point);
    });
  });
  return occupied;
};

export const canPlaceBuildingPoint = (buildingId: BuildingId, point: TilePoint, occupied: Set<string>) => {
  const rounded = { x: Math.round(point.x), y: Math.round(point.y), rotation: normalizeRotation(point.rotation) };
  if (buildingId === 'ports') return isPortBuildablePoint(rounded) && !hasOccupiedOverlap('ports', rounded, occupied);
  if (buildingId === 'museums') return isMuseumBuildablePoint(rounded, occupied);
  return isRoadsideBuildablePoint(buildingId, rounded, occupied);
};

export const alignBuildingPoint = (buildingId: BuildingId, point: TilePoint) => {
  const rounded = { x: Math.round(point.x), y: Math.round(point.y), rotation: normalizeRotation(point.rotation) };
  if (buildingId === 'ports') return withPortRotation(rounded);
  if (buildingId === 'museums') return withMuseumRotation(rounded);
  return withRoadRotation(buildingId, rounded);
};

export const getRandomBuildingPoint = (stats: CityStats, buildingId: BuildingId, index: number) => {
  const occupied = getOccupiedBuildingCells(stats.buildingPositions);
  if (buildingId === 'ports') return getSafePortPoint(index, null, occupied);
  if (buildingId === 'museums') return getSafeMuseumPoint(index, null, occupied);

  const options: TilePoint[] = [];

  for (let y = 0; y < mapSize; y += 1) {
    for (let x = 0; x < mapSize; x += 1) {
      const point = { x, y };
      if (isRoadsideBuildablePoint(buildingId, point, occupied)) options.push(withRoadRotation(buildingId, point));
    }
  }

  const picked = pickPrettyBuildingPoint(options, index);
  return picked ?? getSafeBuildingPoint(buildingId, index, null, occupied);
};

const getSafePortPoint = (index: number, point: TilePoint | null | undefined, occupied: Set<string>) => {
  const rounded = point ? { x: Math.round(point.x), y: Math.round(point.y), rotation: normalizeRotation(point.rotation) } : null;
  if (rounded && isPortBuildablePoint(rounded) && !hasOccupiedOverlap('ports', rounded, occupied)) return withPortRotation(rounded);
  const options = getPortOptions(occupied);
  return options[index % Math.max(1, options.length)] ?? getSafeFallbackPort(index, occupied);
};

const getSafeMuseumPoint = (index: number, point: TilePoint | null | undefined, occupied: Set<string>) => {
  const rounded = point ? { x: Math.round(point.x), y: Math.round(point.y), rotation: normalizeRotation(point.rotation) } : null;
  if (rounded && isMuseumBuildablePoint(rounded, occupied)) return withMuseumRotation(rounded);
  const anchor = museumAnchors[index % museumAnchors.length];
  const nearAnchor = findNearestMuseum(anchor, occupied);
  if (nearAnchor) return nearAnchor;
  const fallback = getConstructionTile('museums', index);
  return findNearestMuseum(fallback, occupied) ?? { ...fallback, rotation: 0 };
};

const getSafeFallbackPort = (index: number, occupied: Set<string>) => {
  const fallback = getConstructionTile('ports', index);
  const nearest = findNearestPort(fallback, occupied) ?? findNearestBuildable('ports', fallback, occupied) ?? fallback;
  return withPortRotation(nearest);
};

const getPortOptions = (occupied: Set<string>) => {
  const options: TilePoint[] = [];
  for (let y = 0; y < mapSize; y += 1) {
    for (let x = 0; x < mapSize; x += 1) {
      const point = { x, y };
      if (isPortBuildablePoint(point) && !hasOccupiedOverlap('ports', point, occupied)) options.push(withPortRotation(point));
    }
  }
  return options.sort((a, b) => Math.abs(a.y - mapSize / 2) - Math.abs(b.y - mapSize / 2));
};

const findNearestPort = (start: TilePoint, occupied: Set<string>) => {
  for (let distance = 0; distance < mapSize; distance += 1) {
    for (let dx = -distance; dx <= distance; dx += 1) {
      for (let dy = -distance; dy <= distance; dy += 1) {
        const point = { x: start.x + dx, y: start.y + dy };
        if (isPortBuildablePoint(point) && !hasOccupiedOverlap('ports', point, occupied)) return withPortRotation(point);
      }
    }
  }
  return null;
};

const isPortBuildablePoint = (point: TilePoint) => {
  return isBuildablePoint(point) && !hasBlockedFootprint('ports', point, true) && Boolean(getWaterDirection(point));
};

const isMuseumBuildablePoint = (point: TilePoint, occupied: Set<string>) => {
  return isRoadsideBuildablePoint('museums', point, occupied);
};

const isRoadsideBuildablePoint = (buildingId: BuildingId, point: TilePoint, occupied: Set<string>) => {
  return isBuildablePoint(point)
    && !hasBlockedFootprint(buildingId, point)
    && !hasOccupiedOverlap(buildingId, point, occupied)
    && Boolean(getRoadDirection(buildingId, point));
};

const withPortRotation = (point: TilePoint): TilePoint => {
  const direction = getWaterDirection(point);
  if (!direction) return point;
  return { ...point, rotation: Math.atan2(direction.dx, direction.dy) };
};

const withMuseumRotation = (point: TilePoint): TilePoint => {
  const direction = getRoadDirection('museums', point);
  if (!direction) return { ...point, rotation: 0 };
  return { ...point, rotation: Math.atan2(direction.dx, direction.dy) };
};

const withRoadRotation = (buildingId: BuildingId, point: TilePoint): TilePoint => {
  const direction = getRoadDirection(buildingId, point);
  if (!direction) return { ...point, rotation: normalizeRotation(point.rotation) ?? 0 };
  return { ...point, rotation: Math.atan2(direction.dx, direction.dy) };
};

const getWaterDirection = (point: TilePoint) => {
  return waterDirections.find(({ dx, dy }) => isWaterCell(point.x + dx, point.y + dy)) ?? null;
};

const getRoadDirection = (buildingId: BuildingId, point: TilePoint) => {
  const offset = getFootprintRadius(buildingId) + 1;
  return waterDirections.find(({ dx, dy }) => isRoadCell(point.x + dx * offset, point.y + dy * offset)) ?? null;
};

const findNearestMuseum = (start: TilePoint, occupied: Set<string>) => {
  for (let distance = 0; distance < mapSize; distance += 1) {
    for (let dx = -distance; dx <= distance; dx += 1) {
      for (let dy = -distance; dy <= distance; dy += 1) {
        const point = { x: start.x + dx, y: start.y + dy };
        if (isMuseumBuildablePoint(point, occupied)) return withMuseumRotation(point);
      }
    }
  }
  return null;
};

const findNearestRoadside = (buildingId: BuildingId, start: TilePoint, occupied: Set<string>) => {
  for (let distance = 0; distance < mapSize; distance += 1) {
    for (let dx = -distance; dx <= distance; dx += 1) {
      for (let dy = -distance; dy <= distance; dy += 1) {
        const point = { x: start.x + dx, y: start.y + dy };
        if (isRoadsideBuildablePoint(buildingId, point, occupied)) return withRoadRotation(buildingId, point);
      }
    }
  }
  return null;
};

const findNearestBuildable = (buildingId: BuildingId, start: TilePoint, occupied: Set<string>) => {
  for (let distance = 0; distance < mapSize; distance += 1) {
    for (let dx = -distance; dx <= distance; dx += 1) {
      for (let dy = -distance; dy <= distance; dy += 1) {
        const point = { x: start.x + dx, y: start.y + dy, rotation: start.rotation };
        if (isBuildablePoint(point) && !hasBlockedFootprint(buildingId, point) && !hasOccupiedOverlap(buildingId, point, occupied)) return point;
      }
    }
  }
  return null;
};

const pickPrettyBuildingPoint = (options: TilePoint[], index: number) => {
  if (options.length === 0) return null;
  const sorted = [...options].sort((a, b) => getPrettyScore(a) - getPrettyScore(b));
  return sorted[index % sorted.length];
};

const getPrettyScore = (point: TilePoint) => {
  const districtX = Math.floor(point.x / 10);
  const districtY = Math.floor(point.y / 10);
  const nearCenter = Math.abs(point.x - 24) + Math.abs(point.y - 24);
  return districtY * 100 + districtX * 10 + nearCenter;
};

const addOccupiedCells = (occupied: Set<string>, buildingId: BuildingId, point: TilePoint) => {
  const radius = getSpacingRadius(buildingId);
  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      occupied.add(`${point.x + dx}-${point.y + dy}`);
    }
  }
};

const hasOccupiedOverlap = (buildingId: BuildingId, point: TilePoint, occupied: Set<string>) => {
  const radius = getSpacingRadius(buildingId);
  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      if (occupied.has(`${point.x + dx}-${point.y + dy}`)) return true;
    }
  }
  return false;
};

const hasBlockedFootprint = (buildingId: BuildingId, point: TilePoint, allowWater = false) => {
  const radius = getFootprintRadius(buildingId);
  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      const x = point.x + dx;
      const y = point.y + dy;
      if (x < 0 || x >= mapSize || y < 0 || y >= mapSize) return true;
      if (isRoadCell(x, y)) return true;
      if (!allowWater && isWaterCell(x, y)) return true;
    }
  }
  return false;
};

const getFootprintRadius = (buildingId: BuildingId) => {
  return footprintRadiusByBuilding[buildingId] ?? 0;
};

const getSpacingRadius = (buildingId: BuildingId) => {
  return getFootprintRadius(buildingId) + 1;
};

const normalizeRotation = (rotation: number | undefined) => {
  if (rotation === undefined) return undefined;
  return Math.abs(rotation) > Math.PI * 2 ? (rotation * Math.PI) / 180 : rotation;
};
