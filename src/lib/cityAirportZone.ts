export type AirportZone = {
  anchorX: number;
  anchorY: number;
  width: number;
  height: number;
};

const airportZones: AirportZone[] = [
  { anchorX: 58, anchorY: 58, width: 8, height: 6 },
  { anchorX: 46, anchorY: 58, width: 8, height: 6 },
  { anchorX: 58, anchorY: 46, width: 8, height: 6 },
];

export const getAirportZones = (count: number) => airportZones.slice(0, count);

export const getAirportAnchor = (index: number) => {
  const zone = airportZones[index % airportZones.length];
  return { x: zone.anchorX, y: zone.anchorY };
};

export const getAirportZoneAt = (x: number, y: number, count: number) => {
  return getAirportZones(count).find((zone) => isInsideZone(x, y, zone)) ?? null;
};

export const isAirportAnchor = (x: number, y: number, zone: AirportZone) => {
  return x === zone.anchorX && y === zone.anchorY;
};

const isInsideZone = (x: number, y: number, zone: AirportZone) => {
  const startX = zone.anchorX - Math.floor(zone.width / 2);
  const startY = zone.anchorY - Math.floor(zone.height / 2);
  return x >= startX && x < startX + zone.width && y >= startY && y < startY + zone.height;
};
