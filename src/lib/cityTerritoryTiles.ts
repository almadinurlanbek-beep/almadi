import type { BuildingId } from './gameTypes';
import type { MapTile, TileKey, TileVariant } from './cityMap';

type TerritoryTileOptions = {
  x: number;
  y: number;
  isAnchor: boolean;
  anchorLabel: string;
  territoryLabel: string;
  anchorModel: TileKey;
  territoryModel: TileKey;
  variant: TileVariant;
  buildingId: BuildingId;
  remaining: Record<BuildingId, number>;
  buildingIndex?: number;
};

export const createTerritoryTile = (options: TerritoryTileOptions): MapTile => {
  const buildingIndex = options.buildingIndex ?? options.remaining[options.buildingId] - 1;
  if (options.isAnchor) options.remaining[options.buildingId] -= 1;
  return {
    id: `${options.x}-${options.y}`,
    x: options.x,
    y: options.y,
    label: options.isAnchor ? options.anchorLabel : options.territoryLabel,
    count: options.isAnchor ? 1 : undefined,
    buildingId: options.isAnchor ? options.buildingId : undefined,
    buildingIndex: options.isAnchor ? buildingIndex : undefined,
    model: options.isAnchor ? options.anchorModel : options.territoryModel,
    variant: options.variant,
  };
};
