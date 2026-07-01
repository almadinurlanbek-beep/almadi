import * as THREE from 'three';
import { cellSize, tileToPosition } from './cityGrid3d';
import { getStationAnchor } from './cityStationZone';

type TrainMover = {
  mesh: THREE.Group;
  route: THREE.Vector3[];
  offset: number;
  speed: number;
};

export type Railway = {
  active: boolean;
  trains: TrainMover[];
};

const depotTile = { x: 76, y: 42 };
const railMaterial = new THREE.MeshLambertMaterial({ color: 0x2a3032 });
const sleeperMaterial = new THREE.MeshLambertMaterial({ color: 0x6d5541 });
const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xb8b1a5 });
const depotMaterial = new THREE.MeshLambertMaterial({ color: 0x7b8588 });

export const addRailwayToScene = (scene: THREE.Scene, stationCount: number): Railway => {
  if (stationCount <= 0) return { active: false, trains: [] };
  const group = new THREE.Group();
  const routes = Array.from({ length: stationCount }, (_, index) => createRoute(index));
  routes.forEach((route) => addTrack(group, route));
  group.add(createTrainDepot());
  scene.add(group);

  const trains = routes.map((route, index) => {
    const train = createMovingTrain(index);
    scene.add(train);
    return { mesh: train, route, offset: index * 4, speed: 0.018 + index * 0.004 };
  });
  return { active: true, trains };
};

export const updateRailway = (railway: Railway, time: number) => {
  if (!railway.active) return;
  railway.trains.forEach((train) => {
    const route = sampleRoute(train.route, time * train.speed + train.offset);
    train.mesh.position.copy(route.position);
    train.mesh.rotation.y = Math.atan2(route.direction.z, -route.direction.x);
  });
};

const createRoute = (index: number) => {
  const station = getStationAnchor(index);
  const y = station.y + 1;
  return [
    tileToPosition(station.x + 2, y, 0.38),
    tileToPosition(76, y, 0.38),
    tileToPosition(depotTile.x, depotTile.y + (index - 1) * 4, 0.38),
  ];
};

const addTrack = (group: THREE.Group, route: THREE.Vector3[]) => {
  for (let index = 0; index < route.length - 1; index += 1) {
    const start = route[index];
    const end = route[index + 1];
    const length = start.distanceTo(end);
    const horizontal = Math.abs(end.x - start.x) > Math.abs(end.z - start.z);
    const center = start.clone().lerp(end, 0.5);
    group.add(createRailSegment(center, length, horizontal));
  }
};

const createRailSegment = (center: THREE.Vector3, length: number, horizontal: boolean) => {
  const group = new THREE.Group();
  const railA = box(horizontal ? length : 0.08, 0.06, horizontal ? 0.08 : length, railMaterial, 0, 0, -0.25);
  const railB = box(horizontal ? length : 0.08, 0.06, horizontal ? 0.08 : length, railMaterial, 0, 0, 0.25);
  if (!horizontal) {
    railA.position.set(-0.25, 0, 0);
    railB.position.set(0.25, 0, 0);
  }
  const sleeperCount = Math.max(4, Math.floor(length / 1.3));
  for (let index = 0; index < sleeperCount; index += 1) {
    const t = sleeperCount === 1 ? 0 : index / (sleeperCount - 1);
    const x = horizontal ? (t - 0.5) * length : 0;
    const z = horizontal ? 0 : (t - 0.5) * length;
    group.add(box(horizontal ? 0.12 : 0.9, 0.04, horizontal ? 0.9 : 0.12, sleeperMaterial, x, -0.03, z));
  }
  group.position.copy(center);
  group.position.y = 0.18;
  group.add(railA, railB);
  return group;
};

const createTrainDepot = () => {
  const group = new THREE.Group();
  group.position.copy(tileToPosition(depotTile.x, depotTile.y, 0.16));
  group.add(box(cellSize * 6.4, 0.08, cellSize * 11, depotMaterial, 0, 0, 0));
  group.add(box(cellSize * 5.8, 0.12, 0.55, platformMaterial, -0.2, 0.12, -cellSize * 3));
  group.add(box(cellSize * 5.8, 0.12, 0.55, platformMaterial, -0.2, 0.12, 0));
  group.add(box(cellSize * 5.8, 0.12, 0.55, platformMaterial, -0.2, 0.12, cellSize * 3));
  group.add(createParkedTrain(-1.2, -cellSize * 3.65, 0x416c99));
  group.add(createParkedTrain(0.8, cellSize * 3.65, 0x7a4e9b));
  return group;
};

const createParkedTrain = (x: number, z: number, color: number) => {
  const train = createMovingTrain(0, color);
  train.scale.setScalar(0.85);
  train.position.set(x, 0.18, z);
  return train;
};

const createMovingTrain = (seed: number, leadColor?: number) => {
  const group = new THREE.Group();
  const colors = [0x2f7d68, 0x416c99, 0xb55d4f, 0x7a4e9b];
  for (let index = 0; index < 4; index += 1) {
    const color = index === 0 ? leadColor ?? colors[Math.abs(seed) % colors.length] : 0x3f8f79;
    group.add(box(1.22, 0.42, 0.42, new THREE.MeshLambertMaterial({ color }), index * 1.18 - 1.7, 0.32, 0));
    group.add(box(0.74, 0.12, 0.045, new THREE.MeshLambertMaterial({ color: 0xa4d6df }), index * 1.18 - 1.7, 0.43, -0.23));
  }
  return group;
};

const sampleRoute = (route: THREE.Vector3[], progress: number) => {
  const lengths = route.slice(0, -1).map((point, index) => point.distanceTo(route[index + 1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const pingPong = Math.abs((progress * total * 2) % (total * 2) - total);
  let distance = pingPong;
  for (let index = 0; index < lengths.length; index += 1) {
    if (distance <= lengths[index]) return interpolate(route[index], route[index + 1], distance / lengths[index]);
    distance -= lengths[index];
  }
  return interpolate(route[route.length - 2], route[route.length - 1], 1);
};

const interpolate = (start: THREE.Vector3, end: THREE.Vector3, progress: number) => ({
  position: start.clone().lerp(end, progress),
  direction: end.clone().sub(start).normalize(),
});

const box = (width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
};
