import { labels, modelByBuilding, variants } from './cityMapConfig';
import type { MapTile } from './cityMap';
import type { BuildingId, CityStats, TilePoint } from './gameTypes';

export type PlacedLookup = Map<string, { buildingId: BuildingId; buildingIndex: number; rotation?: number }>;

export const subtractPlacedBuildings = (remaining: Record<BuildingId, number>, positions: CityStats['buildingPositions']) => {
  Object.entries(positions).forEach(([buildingId, points]) => {
    remaining[buildingId as BuildingId] -= points?.filter(isTilePoint).length ?? 0;
  });
};

export const createPlacedLookup = (positions: CityStats['buildingPositions']) => {
  const lookup: PlacedLookup = new Map();
  Object.entries(positions).forEach(([buildingId, points]) => {
    points?.forEach((point: TilePoint, buildingIndex) => {
      if (!isTilePoint(point)) return;
      lookup.set(`${point.x}-${point.y}`, { buildingId: buildingId as BuildingId, buildingIndex, rotation: point.rotation });
    });
  });
  return lookup;
};

export const createBuildingTile = (x: number, y: number, buildingId: BuildingId, buildingIndex: number, rotation?: number): MapTile => {
  const model = modelByBuilding[buildingId];
  return {
    id: `${x}-${y}`,
    x,
    y,
    label: labels[model],
    count: 1,
    buildingId,
    buildingIndex,
    rotation,
    model,
    variant: variants[model],
  };
};

const isTilePoint = (point: TilePoint | null | undefined): point is TilePoint => {
  return point !== null && point !== undefined && Number.isFinite(point.x) && Number.isFinite(point.y);
};
