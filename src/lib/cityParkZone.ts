export type ParkZone = {
  anchorX: number;
  anchorY: number;
  width: number;
  height: number;
};

const parkZones: ParkZone[] = [
  { anchorX: 7, anchorY: 19, width: 9, height: 9 },
  { anchorX: 27, anchorY: 39, width: 9, height: 9 },
  { anchorX: 57, anchorY: 19, width: 9, height: 9 },
  { anchorX: 67, anchorY: 69, width: 9, height: 9 },
];

export const getParkAnchor = (index: number) => {
  const zone = parkZones[index % parkZones.length];
  return { x: zone.anchorX, y: zone.anchorY };
};

export const getParkZoneAt = (x: number, y: number, count: number) => {
  return parkZones.slice(0, count).find((zone) => isInsideZone(x, y, zone)) ?? null;
};

export const isParkAnchor = (x: number, y: number, zone: ParkZone) => {
  return x === zone.anchorX && y === zone.anchorY;
};

const isInsideZone = (x: number, y: number, zone: ParkZone) => {
  const startX = zone.anchorX - Math.floor(zone.width / 2);
  const startY = zone.anchorY - Math.floor(zone.height / 2);
  return x >= startX && x < startX + zone.width && y >= startY && y < startY + zone.height;
};
