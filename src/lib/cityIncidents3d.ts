import * as THREE from 'three';
import { updateChaseMover } from './cityChaseModel3d';
import { addIncidentModel, createIncidentLabel } from './cityIncidentModels3d';
import { fireTile, tileToPosition } from './cityGrid3d';
import { getStationAnchor } from './cityStationZone';
import type { Incident } from './gameTypes';

export type FireEffect = {
  flames: THREE.Object3D[];
  marker: THREE.Object3D;
  movers: THREE.Object3D[];
  smoke: THREE.Object3D[];
  water: THREE.Object3D[];
};

export const incidentTiles: Record<Incident['kind'], { x: number; y: number }> = {
  fire: fireTile,
  flood: { x: 34, y: 23 },
  crime: getStationAnchor(0),
  chase: { x: 22, y: 24 },
  epidemic: { x: 17, y: 18 },
  robots: { x: 22, y: 34 },
  protest: { x: 49, y: 42 },
  terror: { x: 49, y: 39 },
};

export const addIncidentMarker = (scene: THREE.Scene, incident: Incident | null) => {
  if (!incident) return null;
  const effect: FireEffect = { flames: [], marker: createIncidentLabel(incident.kind), movers: [], smoke: [], water: [] };
  const group = new THREE.Group();
  const tile = incidentTiles[incident.kind];
  group.position.copy(tileToPosition(tile.x, tile.y, 0.14));
  addIncidentModel(group, effect, incident.kind);
  effect.marker.position.set(0, 2.45, 0);
  group.add(effect.marker);
  scene.add(group);
  return effect;
};

export const updateFireEffect = (effect: FireEffect | null, time: number, extinguishing: boolean) => {
  if (!effect) return;
  if (!updateChaseMover(effect.marker, time)) {
    effect.marker.position.y = 2.45 + Math.sin(time * 3) * 0.18;
  }
  effect.flames.forEach((flame, index) => {
    const scale = extinguishing ? 0.42 : 1;
    flame.scale.setScalar(scale + Math.sin(time * 9 + index) * 0.14);
    flame.rotation.y += 0.03;
  });
  effect.smoke.forEach((smoke, index) => {
    smoke.position.y = 1 + index * 0.16 + Math.sin(time * 2 + index) * 0.12;
  });
  effect.movers.forEach((item, index) => {
    if (updateChaseMover(item, time)) return;
    item.rotation.y += 0.012 + index * 0.003;
    item.position.y += Math.sin(time * 4 + index) * 0.002;
  });
};
