import * as THREE from 'three';
import { tileToPosition } from './cityGrid3d';
import type { MapTile } from './cityMap';

const PHASE_SECONDS = 7;

export type TrafficLightRig = {
  group: THREE.Group;
  red: THREE.Mesh;
  green: THREE.Mesh;
  greenOn?: boolean;
};

export const addTrafficLights = (scene: THREE.Scene, tiles: MapTile[]) => {
  const lights: TrafficLightRig[] = [];
  tiles.filter((tile) => isIntersectionTile(tile.x, tile.y)).forEach((tile) => {
    const light = createTrafficLight(tile.x, tile.y);
    light.group.position.copy(tileToPosition(tile.x, tile.y, 0.08));
    scene.add(light.group);
    lights.push(light);
  });
  return lights;
};

export const isRedLightForSegment = (from: THREE.Vector3, to: THREE.Vector3, time: number) => {
  const target = positionToTile(to);
  if (!isIntersectionTile(target.x, target.y)) return false;
  const horizontalMove = Math.abs(to.x - from.x) > Math.abs(to.z - from.z);
  const horizontalGreen = Math.floor(time / PHASE_SECONDS) % 2 === 0;
  return horizontalMove ? !horizontalGreen : horizontalGreen;
};

export const getStopProgressBeforeLight = (from: THREE.Vector3, to: THREE.Vector3) => {
  const target = positionToTile(to);
  if (!isIntersectionTile(target.x, target.y)) return null;
  const segmentLength = from.distanceTo(to);
  const stopDistance = 2.45;
  return Math.max(0.08, Math.min(0.9, 1 - stopDistance / segmentLength));
};

export const updateTrafficLights = (lights: TrafficLightRig[], time: number) => {
  const horizontalGreen = Math.floor(time / PHASE_SECONDS) % 2 === 0;
  lights.forEach((light, index) => {
    const greenOn = index % 2 === 0 ? horizontalGreen : !horizontalGreen;
    if (light.greenOn === greenOn) return;
    light.greenOn = greenOn;
    setLightColor(light.green, greenOn ? 0x32d96b : 0x17452a);
    setLightColor(light.red, greenOn ? 0x4f1714 : 0xff3b30);
  });
};

const createTrafficLight = (x: number, y: number) => {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), new THREE.MeshLambertMaterial({ color: 0x252b2d }));
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.12), new THREE.MeshLambertMaterial({ color: 0x1f2426 }));
  const red = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3b30 }));
  const green = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0x32d96b }));
  const sideX = x % 20 === 2 ? -0.86 : 0.86;
  const sideZ = y % 20 === 4 ? -0.86 : 0.86;
  pole.position.set(sideX, 0.45, sideZ);
  box.position.set(sideX, 0.98, sideZ);
  red.position.set(sideX, 1.08, sideZ - 0.065);
  green.position.set(sideX, 0.9, sideZ - 0.065);
  group.add(pole, box, red, green);
  return { group, red, green };
};

const setLightColor = (light: THREE.Mesh, color: number) => {
  (light.material as THREE.MeshBasicMaterial).color.setHex(color);
};

const isIntersectionTile = (x: number, y: number) => x % 10 === 2 && y % 10 === 4;

const positionToTile = (position: THREE.Vector3) => ({
  x: Math.round(position.x / 2.2 + 39.5),
  y: Math.round(position.z / 2.2 + 39.5),
});
