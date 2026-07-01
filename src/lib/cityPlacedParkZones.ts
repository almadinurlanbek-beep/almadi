import { labels } from './cityMapConfig';
import type { MapTile } from './cityMap';
import type { CityStats, TilePoint } from './gameTypes';

const parkZoneSize = 9;

export const createPlacedParkZoneTile = (
  x: number,
  y: number,
  positions: CityStats['buildingPositions'],
  isBlocked: (x: number, y: number) => boolean,
): MapTile | null => {
  if (isBlocked(x, y)) return null;
  const parks = positions.parks ?? [];
  const parkIndex = parks.findIndex((point) => point && isInsideParkZone(x, y, point));
  if (parkIndex < 0) return null;
  const anchor = parks[parkIndex];
  const isAnchor = anchor.x === x && anchor.y === y;
  return {
    id: `${x}-${y}`,
    x,
    y,
    label: isAnchor ? labels.park : 'Территория парка',
    count: isAnchor ? 1 : undefined,
    buildingId: isAnchor ? 'parks' : undefined,
    buildingIndex: isAnchor ? parkIndex : undefined,
    rotation: isAnchor ? anchor.rotation : undefined,
    model: 'park',
    variant: 'nature',
  };
};

const isInsideParkZone = (x: number, y: number, anchor: TilePoint) => {
  const startX = anchor.x - Math.floor(parkZoneSize / 2);
  const startY = anchor.y - Math.floor(parkZoneSize / 2);
  return x >= startX && x < startX + parkZoneSize && y >= startY && y < startY + parkZoneSize;
};
