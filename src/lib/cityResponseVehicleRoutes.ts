import { incidentTiles } from './cityIncidents3d';
import { isRoadCell } from './cityMap';
import type { Incident, ResponseMethod } from './gameTypes';

export type ResponseVehicleKind = 'police' | 'fire' | 'ambulance';

export type ResponseVehicleRoute = {
  kind: ResponseVehicleKind;
  points: [number, number][];
};

export const getResponseVehicleRoutes = (kind: Incident['kind'] | undefined, methods: ResponseMethod[]) => {
  if (!kind) return [];
  const target = incidentTiles[kind];
  return methods.reduce<ResponseVehicleRoute[]>((routes, method) => {
    const responseRoute = getResponseRoute(method, target);
    return responseRoute ? [...routes, responseRoute] : routes;
  }, []);
};

const getResponseRoute = (method: ResponseMethod, target: { x: number; y: number }): ResponseVehicleRoute | null => {
  const roadTarget = getNearestRoadTarget(target);
  if (method === 'firefighters' || method === 'rescuers') return { kind: 'fire', points: createRoadRoute([22, 34], roadTarget) };
  if (method === 'police' || method === 'detectives' || method === 'negotiators') return { kind: 'police', points: createRoadRoute([2, 4], roadTarget) };
  if (method === 'ambulance' || method === 'epidemiologists') return { kind: 'ambulance', points: createRoadRoute([42, 4], roadTarget) };
  if (method === 'engineers') return { kind: 'ambulance', points: createRoadRoute([58, 34], roadTarget) };
  return null;
};

const getNearestRoadTarget = (target: { x: number; y: number }): [number, number] => {
  for (let distance = 0; distance <= 8; distance += 1) {
    for (let dx = -distance; dx <= distance; dx += 1) {
      for (let dy = -distance; dy <= distance; dy += 1) {
        const x = target.x + dx;
        const y = target.y + dy;
        if (isRoadCell(x, y)) return [x, y];
      }
    }
  }
  return [target.x, target.y];
};

const createRoadRoute = (start: [number, number], target: [number, number]): [number, number][] => {
  if (start[1] % 10 === 4) return [start, [target[0], start[1]], target];
  return [start, [start[0], target[1]], target];
};
