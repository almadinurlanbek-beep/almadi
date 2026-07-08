import * as THREE from 'three';
import type { MapTile } from './cityMap';
import { tileToPosition } from './cityGrid3d';
import { createPerson } from './cityPersonModel3d';

export type Pedestrian = {
  group: THREE.Group;
  path: THREE.Vector3[];
  speed: number;
  offset: number;
  body: THREE.Object3D;
  head: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  leftFoot: THREE.Object3D;
  rightFoot: THREE.Object3D;
};

export const addPedestrians = (scene: THREE.Scene, tiles: MapTile[]) => (
  tiles
    .filter((tile) => (tile.count && ['home', 'mall'].includes(tile.model)) || tile.model === 'park')
    .slice(0, 18)
    .flatMap((tile, tileIndex) => createTilePeople(scene, tile, tileIndex))
    .slice(0, 36)
);

export const updatePedestrians = (pedestrians: Pedestrian[], time: number) => {
  pedestrians.forEach((person) => {
    moveAlongPath(person, time);
    animateWalk(person, time);
  });
};

const moveAlongPath = (person: Pedestrian, time: number) => {
  const total = time * person.speed + person.offset;
  const segment = Math.floor(total) % person.path.length;
  const next = (segment + 1) % person.path.length;
  const rawProgress = total % 1;
  const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
  person.group.position.lerpVectors(person.path[segment], person.path[next], progress);
  const direction = person.path[next].clone().sub(person.path[segment]);
  const targetRotation = Math.atan2(direction.x, direction.z);
  person.group.rotation.y = THREE.MathUtils.lerp(person.group.rotation.y, targetRotation, 0.18);
};

const animateWalk = (person: Pedestrian, time: number) => {
  const rhythm = time * person.speed * 9 + person.offset;
  const step = Math.sin(rhythm);
  const bounce = Math.abs(step);
  person.leftArm.rotation.x = step * 0.52;
  person.rightArm.rotation.x = -step * 0.52;
  person.leftLeg.rotation.x = -step * 0.46;
  person.rightLeg.rotation.x = step * 0.46;
  person.leftFoot.rotation.x = Math.max(0, step) * 0.32;
  person.rightFoot.rotation.x = Math.max(0, -step) * 0.32;
  person.body.rotation.z = Math.sin(rhythm * 0.5) * 0.05;
  person.body.rotation.x = Math.cos(rhythm) * 0.035;
  person.head.rotation.y = Math.sin(rhythm * 0.35 + person.offset) * 0.28;
  person.head.rotation.z = Math.sin(rhythm * 0.45) * 0.05;
  person.group.position.y = 0.2 + bounce * 0.035;
};

const createTilePeople = (scene: THREE.Scene, tile: MapTile, tileIndex: number) => {
  const count = tile.model === 'mall' ? 4 : tile.model === 'park' ? 1 + (tileIndex % 2) : 2;
  return Array.from({ length: count }, (_, personIndex) => {
    const person = createPerson(tile.model, tileIndex + personIndex);
    const origin = tileToPosition(tile.x, tile.y, 0.2);
    const path = createWalkingPath(origin, tile.model, personIndex);
    person.group.position.copy(path[0]);
    scene.add(person.group);
    return {
      group: person.group,
      path,
      speed: 0.45 + (tileIndex % 5) * 0.08,
      offset: tileIndex * 0.7 + personIndex,
      body: person.body,
      head: person.head,
      leftArm: person.leftArm,
      rightArm: person.rightArm,
      leftLeg: person.leftLeg,
      rightLeg: person.rightLeg,
      leftFoot: person.leftFoot,
      rightFoot: person.rightFoot,
    };
  });
};

const createWalkingPath = (origin: THREE.Vector3, model: MapTile['model'], personIndex: number) => {
  const routes = model === 'park' ? parkRoutes : buildingRoutes;
  const route = routes[personIndex % routes.length];
  return route.map(([x, z]) => origin.clone().add(new THREE.Vector3(x, 0, z)));
};

const buildingRoutes = [
  [[-0.92, -0.92], [0.92, -0.92], [0.92, 0.92], [-0.92, 0.92]],
  [[-0.92, 0.72], [-0.2, 0.92], [0.92, 0.72], [0.92, -0.72], [-0.92, -0.72]],
  [[-0.72, -0.92], [0.72, -0.92], [0.92, 0], [0.72, 0.92], [-0.72, 0.92], [-0.92, 0]],
] as const;

const parkRoutes = [
  [[-0.9, -0.82], [0.9, -0.82], [0.9, 0.82], [-0.9, 0.82]],
  [[-0.82, 0], [-0.28, -0.82], [0.82, -0.28], [0.28, 0.82]],
  [[-0.9, 0.58], [-0.2, 0.9], [0.9, 0.36], [0.18, -0.9], [-0.82, -0.24]],
] as const;
