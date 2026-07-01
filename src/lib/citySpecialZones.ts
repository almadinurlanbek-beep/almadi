import { getAirportZoneAt, isAirportAnchor } from './cityAirportZone';
import { getMallZoneAt, isMallAnchor } from './cityMallZone';
import { getMilitaryZoneAt, isMilitaryAnchor } from './cityMilitaryZone';
import { getParkZoneAt, isParkAnchor } from './cityParkZone';
import { getStationZoneAt, isStationAnchor } from './cityStationZone';
import { labels } from './cityMapConfig';
import { createTerritoryTile } from './cityTerritoryTiles';
import type { BuildingId } from './gameTypes';

type SpecialZoneCounts = {
  airports: number;
  stations: number;
  parks: number;
  malls: number;
  militaryBases: number;
};

export const createSpecialZoneTile = (
  x: number,
  y: number,
  remaining: Record<BuildingId, number>,
  counts: SpecialZoneCounts,
  isBlocked: (x: number, y: number) => boolean,
  takeBuildingIndex: (buildingId: BuildingId) => number,
) => {
  if (isBlocked(x, y)) return null;

  const mallZone = getMallZoneAt(x, y, counts.malls);
  if (mallZone) {
    const isAnchor = isMallAnchor(x, y, mallZone);
    return createTerritoryTile({
      x,
      y,
      remaining,
      isAnchor,
      buildingIndex: isAnchor ? takeBuildingIndex('malls') : undefined,
      anchorLabel: labels.mall,
      territoryLabel: 'Территория ТЦ',
      anchorModel: 'mall',
      territoryModel: 'lot',
      variant: 'work',
      buildingId: 'malls',
    });
  }

  const airportZone = getAirportZoneAt(x, y, counts.airports);
  if (airportZone) {
    const isAnchor = isAirportAnchor(x, y, airportZone);
    return createTerritoryTile({
      x,
      y,
      remaining,
      isAnchor,
      buildingIndex: isAnchor ? takeBuildingIndex('airports') : undefined,
      anchorLabel: labels.airport,
      territoryLabel: 'Территория аэропорта',
      anchorModel: 'airport',
      territoryModel: 'lot',
      variant: 'work',
      buildingId: 'airports',
    });
  }

  const stationZone = getStationZoneAt(x, y, counts.stations);
  if (stationZone) {
    const isAnchor = isStationAnchor(x, y, stationZone);
    return createTerritoryTile({
      x,
      y,
      remaining,
      isAnchor,
      buildingIndex: isAnchor ? takeBuildingIndex('stations') : undefined,
      anchorLabel: labels.station,
      territoryLabel: 'Территория вокзала',
      anchorModel: 'station',
      territoryModel: 'lot',
      variant: 'work',
      buildingId: 'stations',
    });
  }

  const militaryZone = getMilitaryZoneAt(x, y, counts.militaryBases);
  if (militaryZone) {
    const isAnchor = isMilitaryAnchor(x, y, militaryZone);
    return createTerritoryTile({
      x,
      y,
      remaining,
      isAnchor,
      buildingIndex: isAnchor ? takeBuildingIndex('militaryBases') : undefined,
      anchorLabel: labels.military,
      territoryLabel: 'Территория военной базы',
      anchorModel: 'military',
      territoryModel: 'lot',
      variant: 'service',
      buildingId: 'militaryBases',
    });
  }

  const parkZone = getParkZoneAt(x, y, counts.parks);
  if (parkZone) {
    const isAnchor = isParkAnchor(x, y, parkZone);
    return createTerritoryTile({
      x,
      y,
      remaining,
      isAnchor,
      buildingIndex: isAnchor ? takeBuildingIndex('parks') : undefined,
      anchorLabel: labels.park,
      territoryLabel: 'Территория парка',
      anchorModel: 'park',
      territoryModel: 'park',
      variant: 'nature',
      buildingId: 'parks',
    });
  }

  return null;
};
