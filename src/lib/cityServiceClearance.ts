import type { BuildingId, CityStats, TilePoint } from './gameTypes';

type ClearanceOptions<TModel extends string> = {
  mapSize: number;
  positions: CityStats['buildingPositions'];
  counts: Record<BuildingId, number>;
  isBlocked: (x: number, y: number) => boolean;
  getPlannedModel: (x: number, y: number) => TModel;
};

const serviceBuildings = ['police', 'fireStations'] as const;
const clearanceRadius = 2;

export const createServiceClearance = <TModel extends string>(options: ClearanceOptions<TModel>) => {
  const anchors = serviceBuildings.flatMap((buildingId) => getServiceAnchors(buildingId, options));
  return new Set(anchors.flatMap((anchor) => getClearanceKeys(anchor, options.mapSize)));
};

const getServiceAnchors = <TModel extends string>(
  buildingId: (typeof serviceBuildings)[number],
  options: ClearanceOptions<TModel>,
) => {
  const placed = options.positions[buildingId]?.filter(Boolean) ?? [];
  const plannedCount = Math.max(0, options.counts[buildingId] - placed.length);
  return [...placed, ...getPlannedServiceTiles(buildingId, plannedCount, options)];
};

const getPlannedServiceTiles = <TModel extends string>(
  buildingId: (typeof serviceBuildings)[number],
  count: number,
  options: ClearanceOptions<TModel>,
) => {
  const model = buildingId === 'police' ? 'police' : 'fire';
  const points: TilePoint[] = [];
  for (let y = 0; y < options.mapSize && points.length < count; y += 1) {
    for (let x = 0; x < options.mapSize && points.length < count; x += 1) {
      if (options.isBlocked(x, y) || options.getPlannedModel(x, y) !== model) continue;
      points.push({ x, y });
    }
  }
  return points;
};

const getClearanceKeys = (anchor: TilePoint, mapSize: number) => {
  const keys: string[] = [];
  for (let dx = -clearanceRadius; dx <= clearanceRadius; dx += 1) {
    for (let dy = -clearanceRadius; dy <= clearanceRadius; dy += 1) {
      const x = anchor.x + dx;
      const y = anchor.y + dy;
      if (x < 0 || y < 0 || x >= mapSize || y >= mapSize) continue;
      if (Math.abs(dx) + Math.abs(dy) > clearanceRadius) continue;
      keys.push(`${x}-${y}`);
    }
  }
  return keys;
};
