import { incidentTiles } from './cityIncidents3d';
import type { CityStats, Incident, ResponseMethod } from './gameTypes';

export type ResponseVehicleKind = 'police' | 'fire' | 'ambulance';

export type ResponseVehicleRoute = {
  kind: ResponseVehicleKind;
  points: [number, number][];
  lookAt: [number, number];
  elapsedSeconds: number;
};

export const getResponseVehicleRoutes = (incident: Incident | null | undefined, responses: CityStats['incidentResponses']) => {
  if (!incident) return [];
  const target = incident.tile ?? incidentTiles[incident.kind];
  return responses.reduce<ResponseVehicleRoute[]>((routes, response) => {
    const responseRoute = getResponseRoute(response.method, target);
    if (!responseRoute) return routes;
    const count = Math.max(1, Math.min(10, response.people));
    const elapsedSeconds = Math.max(0, 60 - response.remainingSeconds);
    return [...routes, ...Array.from({ length: count }, () => ({ ...responseRoute, elapsedSeconds }))];
  }, []);
};

const getResponseRoute = (method: ResponseMethod, target: { x: number; y: number }): ResponseVehicleRoute | null => {
  const roadTarget = getNearestRoadIntersection(target);
  const lookAt: [number, number] = [target.x, target.y];
  if (method === 'firefighters' || method === 'rescuers') return { kind: 'fire', points: createRoadRoute([22, 34], roadTarget), lookAt, elapsedSeconds: 0 };
  if (method === 'police' || method === 'detectives' || method === 'negotiators') return { kind: 'police', points: createRoadRoute([2, 4], roadTarget), lookAt, elapsedSeconds: 0 };
  if (method === 'ambulance' || method === 'epidemiologists') return { kind: 'ambulance', points: createRoadRoute([42, 4], roadTarget), lookAt, elapsedSeconds: 0 };
  if (method === 'engineers') return { kind: 'ambulance', points: createRoadRoute([62, 34], roadTarget), lookAt, elapsedSeconds: 0 };
  return null;
};

const roadColumns = [2, 12, 22, 32, 42, 52, 62, 72] as const;
const roadRows = [4, 14, 24, 34, 44, 54, 64, 74] as const;

const getNearestRoadIntersection = (target: { x: number; y: number }): [number, number] => {
  return [nearest(target.x, roadColumns), nearest(target.y, roadRows)];
};

const nearest = (value: number, roads: readonly number[]) => {
  return roads.reduce((best, road) => (Math.abs(road - value) < Math.abs(best - value) ? road : best), roads[0]);
};

const createRoadRoute = (start: [number, number], target: [number, number]): [number, number][] => {
  const snappedStart = getNearestRoadIntersection({ x: start[0], y: start[1] });
  const horizontal = createLine(snappedStart[0], target[0], snappedStart[1], 'x');
  const vertical = createLine(snappedStart[1], target[1], target[0], 'y');
  return dedupeRoute([...horizontal, ...vertical]);
};

const createLine = (from: number, to: number, fixed: number, axis: 'x' | 'y'): [number, number][] => {
  const roads = axis === 'x' ? roadColumns : roadRows;
  const min = Math.min(from, to);
  const max = Math.max(from, to);
  const points = roads
    .filter((road) => road >= min && road <= max)
    .sort((a, b) => (from <= to ? a - b : b - a));
  return points.map((road) => (axis === 'x' ? [road, fixed] : [fixed, road]));
};

const dedupeRoute = (points: [number, number][]) => {
  return points.filter((point, index) => index === 0 || point[0] !== points[index - 1][0] || point[1] !== points[index - 1][1]);
};
