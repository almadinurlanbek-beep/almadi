export type MallZone = {
  anchorX: number;
  anchorY: number;
  width: number;
  height: number;
};

const mallZones: MallZone[] = [
  { anchorX: 7, anchorY: 8, width: 4, height: 4 },
  { anchorX: 27, anchorY: 18, width: 4, height: 4 },
  { anchorX: 47, anchorY: 48, width: 4, height: 4 },
  { anchorX: 67, anchorY: 28, width: 4, height: 4 },
];

export const getMallAnchor = (index: number) => {
  const zone = mallZones[index % mallZones.length];
  return { x: zone.anchorX, y: zone.anchorY };
};

export const getMallZoneAt = (x: number, y: number, count: number) => {
  return mallZones.slice(0, count).find((zone) => isInsideZone(x, y, zone)) ?? null;
};

export const getMallVariantAt = (x: number, y: number) => {
  const index = mallZones.findIndex((zone) => isInsideZone(x, y, zone));
  return index < 0 ? 0 : index % 3;
};

export const isMallAnchor = (x: number, y: number, zone: MallZone) => {
  return x === zone.anchorX && y === zone.anchorY;
};

const isInsideZone = (x: number, y: number, zone: MallZone) => {
  const startX = zone.anchorX - Math.floor(zone.width / 2);
  const startY = zone.anchorY - Math.floor(zone.height / 2);
  return x >= startX && x < startX + zone.width && y >= startY && y < startY + zone.height;
};
