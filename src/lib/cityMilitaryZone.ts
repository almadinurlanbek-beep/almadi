export type MilitaryZone = {
  anchorX: number;
  anchorY: number;
  width: number;
  height: number;
};

const militaryZones: MilitaryZone[] = [
  { anchorX: 67, anchorY: 69, width: 9, height: 9 },
  { anchorX: 7, anchorY: 69, width: 9, height: 9 },
  { anchorX: 67, anchorY: 9, width: 9, height: 9 },
];

export const getMilitaryAnchor = (index: number) => {
  const zone = militaryZones[index % militaryZones.length];
  return { x: zone.anchorX, y: zone.anchorY };
};

export const getMilitaryZoneAt = (x: number, y: number, count: number) => {
  return militaryZones.slice(0, count).find((zone) => isInsideZone(x, y, zone)) ?? null;
};

export const isMilitaryAnchor = (x: number, y: number, zone: MilitaryZone) => {
  return x === zone.anchorX && y === zone.anchorY;
};

const isInsideZone = (x: number, y: number, zone: MilitaryZone) => {
  const startX = zone.anchorX - Math.floor(zone.width / 2);
  const startY = zone.anchorY - Math.floor(zone.height / 2);
  return x >= startX && x < startX + zone.width && y >= startY && y < startY + zone.height;
};
