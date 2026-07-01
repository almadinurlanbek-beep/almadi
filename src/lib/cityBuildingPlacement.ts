import { getConstructionTile, isRoadCell, isWaterCell } from './cityMap';
import type { BuildingId, CityStats, TilePoint } from './gameTypes';

const mapSize = 80;

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

  (Object.entries(stats.buildingPositions ?? {}) as [BuildingId, Array<TilePoint | null | undefined>][]).forEach(([buildingId, points]) => {
    const visiblePoints = points.slice(0, stats.buildings[buildingId] ?? 0);
    buildingPositions[buildingId] = visiblePoints.map((point, index) => {
      const repaired = getSafeBuildingPoint(buildingId, index, point, occupied);
      occupied.add(key(repaired));
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
  const rounded = point ? { x: Math.round(point.x), y: Math.round(point.y), rotation: point.rotation } : getConstructionTile(buildingId, index);
  if (isBuildablePoint(rounded) && !occupied.has(key(rounded))) return rounded;
  const fallback = getConstructionTile(buildingId, index);
  return findNearestBuildable(fallback, occupied) ?? findNearestBuildable(rounded, occupied) ?? fallback;
};

export const getOccupiedBuildingCells = (positions: CityStats['buildingPositions'], except?: { buildingId: BuildingId; index: number }) => {
  const occupied = new Set<string>();
  (Object.entries(positions ?? {}) as [BuildingId, TilePoint[]][]).forEach(([buildingId, points]) => {
    points.forEach((point, index) => {
      if (except && except.buildingId === buildingId && except.index === index) return;
      occupied.add(key(point));
    });
  });
  return occupied;
};

const findNearestBuildable = (start: TilePoint, occupied: Set<string>) => {
  for (let distance = 0; distance < mapSize; distance += 1) {
    for (let dx = -distance; dx <= distance; dx += 1) {
      for (let dy = -distance; dy <= distance; dy += 1) {
        const point = { x: start.x + dx, y: start.y + dy, rotation: start.rotation };
        if (isBuildablePoint(point) && !occupied.has(key(point))) return point;
      }
    }
  }
  return null;
};

const key = (point: TilePoint) => `${point.x}-${point.y}`;
