import * as THREE from 'three';
import type { FireEffect } from './cityIncidents3d';
import { tileToPosition } from './cityGrid3d';
import { createCivilianCar, createPoliceCar } from './cityVehicleModels3d';

const chaseOrigin = tileToPosition(22, 24, 0);
const suspectTiles: [number, number][] = [
  [2, 4],
  [72, 4],
  [72, 24],
  [32, 24],
  [32, 64],
  [62, 64],
  [62, 14],
  [12, 14],
  [12, 54],
  [52, 54],
  [52, 74],
  [2, 74],
];
const suspectPath = suspectTiles.map(([x, y]) => tileToPosition(x, y, 0.32).sub(chaseOrigin));
const chaseSpeed = 0.2;
const policeDelay = -0.22;
const maxExtraPoliceCars = 10;

export const addChaseModel = (group: THREE.Group, effect: FireEffect, calledPoliceCars = 0) => {
  const suspect = createCivilianCar(0x2b2f36);
  suspect.scale.setScalar(0.9);
  suspect.userData.chase = { offset: 0, speed: chaseSpeed, path: suspectPath };
  effect.marker.userData.chase = { offset: 0, speed: chaseSpeed, path: suspectPath, height: 2.45 };
  group.add(suspect);
  effect.movers.push(suspect);

  const policeCount = 1 + Math.min(maxExtraPoliceCars, Math.max(0, calledPoliceCars));
  for (let index = 0; index < policeCount; index += 1) {
    addPoliceChaser(group, effect, index);
  }
};

export const updateChaseMover = (item: THREE.Object3D, time: number) => {
  const chase = item.userData.chase as { offset: number; speed: number; path: THREE.Vector3[]; height?: number; side?: number } | undefined;
  if (!chase) return false;
  const total = time * chase.speed + chase.offset;
  const segment = ((Math.floor(total) % chase.path.length) + chase.path.length) % chase.path.length;
  const next = (segment + 1) % chase.path.length;
  const progress = total - Math.floor(total);
  item.position.lerpVectors(chase.path[segment], chase.path[next], progress);
  if (chase.side) {
    const direction = chase.path[next].clone().sub(chase.path[segment]);
    item.position.add(new THREE.Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(chase.side));
  }
  if (chase.height !== undefined) {
    item.position.y = chase.height + Math.sin(time * 3) * 0.18;
  }
  const direction = chase.path[next].clone().sub(chase.path[segment]);
  item.rotation.y = Math.atan2(direction.z, -direction.x);
  item.children.filter((child) => child.name === 'wheel').forEach((wheel) => {
    wheel.rotation.z -= 0.22;
  });
  return true;
};

const createSirenPulse = () => {
  const pulse = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.035, 8, 32), new THREE.MeshBasicMaterial({ color: 0x2e77d0 }));
  pulse.rotation.x = Math.PI / 2;
  pulse.position.y = 0.08;
  return pulse;
};

const addPoliceChaser = (group: THREE.Group, effect: FireEffect, index: number) => {
  const police = createPoliceCar();
  const pulse = createSirenPulse();
  const offset = policeDelay - index * 0.18;
  const side = index % 2 === 0 ? -0.22 : 0.22;
  police.scale.setScalar(0.9);
  police.userData.chase = { offset, speed: chaseSpeed, path: suspectPath, side };
  pulse.userData.chase = { offset, speed: chaseSpeed, path: suspectPath, height: 0.08, side };
  group.add(police, pulse);
  effect.movers.push(police, pulse);
};
