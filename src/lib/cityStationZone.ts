export type StationZone = {
  anchorX: number;
  anchorY: number;
  width: number;
  height: number;
};

const stationZones: StationZone[] = [
  { anchorX: 18, anchorY: 26, width: 5, height: 3 },
  { anchorX: 48, anchorY: 26, width: 5, height: 3 },
  { anchorX: 18, anchorY: 56, width: 5, height: 3 },
];

export const getStationAnchor = (index: number) => {
  const zone = stationZones[index % stationZones.length];
  return { x: zone.anchorX, y: zone.anchorY };
};

export const getStationZoneAt = (x: number, y: number, count: number) => {
  return stationZones.slice(0, count).find((zone) => isInsideZone(x, y, zone)) ?? null;
};

export const isStationAnchor = (x: number, y: number, zone: StationZone) => {
  return x === zone.anchorX && y === zone.anchorY;
};

const isInsideZone = (x: number, y: number, zone: StationZone) => {
  const startX = zone.anchorX - Math.floor(zone.width / 2);
  const startY = zone.anchorY - Math.floor(zone.height / 2);
  return x >= startX && x < startX + zone.width && y >= startY && y < startY + zone.height;
};
