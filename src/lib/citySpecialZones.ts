import { getAirportZoneAt, isAirportAnchor } from './cityAirportZone';
import { getMallZoneAt, isMallAnchor } from './cityMallZone';
import { getParkZoneAt, isParkAnchor } from './cityParkZone';
import { getStationZoneAt, isStationAnchor } from './cityStationZone';
import { labels } from './cityMapConfig';
import { createTerritoryTile } from './cityTerritoryTiles';
import type { BuildingId } from './gameTypes';
import type { MapTile } from './cityMap';

export const createSpecialZoneTile = (
  x: number,
  y: number,
  remaining: Record<BuildingId, number>,
  counts: { airports: number; stations: number; parks: number; malls: number },
  isBlocked: (x: number, y: number) => boolean,
) => {
  if (isBlocked(x, y)) return null;
  const mallZone = getMallZoneAt(x, y, counts.malls);
  if (mallZone) return createTerritoryTile({
    x, y, remaining, isAnchor: isMallAnchor(x, y, mallZone),
    anchorLabel: labels.mall, territoryLabel: 'Территория ТЦ',
    anchorModel: 'mall', territoryModel: 'lot', variant: 'work', buildingId: 'malls',
  });
  const airportZone = getAirportZoneAt(x, y, counts.airports);
  if (airportZone) return createTerritoryTile({
    x, y, remaining, isAnchor: isAirportAnchor(x, y, airportZone),
    anchorLabel: labels.airport, territoryLabel: 'Территория аэропорта',
    anchorModel: 'airport', territoryModel: 'lot', variant: 'work', buildingId: 'airports',
  });
  const stationZone = getStationZoneAt(x, y, counts.stations);
  if (stationZone) return createTerritoryTile({
    x, y, remaining, isAnchor: isStationAnchor(x, y, stationZone),
    anchorLabel: labels.station, territoryLabel: 'Территория вокзала',
    anchorModel: 'station', territoryModel: 'lot', variant: 'work', buildingId: 'stations',
  });
  const parkZone = getParkZoneAt(x, y, counts.parks);
  if (parkZone) return createTerritoryTile({
    x, y, remaining, isAnchor: isParkAnchor(x, y, parkZone),
    anchorLabel: labels.park, territoryLabel: 'Территория парка',
    anchorModel: 'park', territoryModel: 'park', variant: 'nature', buildingId: 'parks',
  });
  return null satisfies MapTile | null;
};
