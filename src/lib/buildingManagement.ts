import { buildings } from './gameData';
import type { BuildingId, CityStats, TilePoint } from './gameTypes';

export const refundBuilding = (stats: CityStats, buildingId: BuildingId, index: number) => {
  if (stats.buildings[buildingId] <= 0) return stats;
  const cost = buildings.find((building) => building.id === buildingId)?.cost ?? 0;
  const positions = stats.buildingPositions[buildingId] ?? [];
  return {
    ...stats,
    money: stats.money + Math.round(cost * 0.5),
    buildings: { ...stats.buildings, [buildingId]: Math.max(0, stats.buildings[buildingId] - 1) },
    buildingPositions: {
      ...stats.buildingPositions,
      [buildingId]: positions.filter((_, itemIndex) => itemIndex !== index),
    },
  };
};

export const moveBuilding = (stats: CityStats, buildingId: BuildingId, index: number, point: TilePoint) => {
  if (stats.buildings[buildingId] <= index) return stats;
  const positions = [...(stats.buildingPositions[buildingId] ?? [])];
  positions[index] = point;
  return {
    ...stats,
    buildingPositions: {
      ...stats.buildingPositions,
      [buildingId]: positions,
    },
  };
};
