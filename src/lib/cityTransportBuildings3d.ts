import * as THREE from 'three';
import { cellSize } from './cityGrid3d';

const concrete = new THREE.MeshLambertMaterial({ color: 0xaeb6b8 });
const line = new THREE.MeshLambertMaterial({ color: 0xf3d35b });
const fence = new THREE.MeshLambertMaterial({ color: 0x2f3638 });
const gate = new THREE.MeshLambertMaterial({ color: 0x59656a });

export const createAirport = () => {
  const group = new THREE.Group();
  const footprint = createBox(cellSize * 7.2, 0.04, cellSize * 6.2, 0x7f8d82, 0, 0.03, 0);
  const runway = createBox(cellSize * 7, 0.06, 0.62, 0x34393b, 0, 0.08, -cellSize * 2.1);
  const taxiway = createBox(cellSize * 5.6, 0.05, 0.36, 0x4a5052, -0.1, 0.1, -cellSize * 0.9);
  const terminal = createTerminal();
  const tower = createTower();
  const parking = createParking();
  const fenceGroup = createAirportFence(cellSize * 7.2, cellSize * 6.2);

  terminal.position.set(-cellSize * 1.5, 0, cellSize * 1.15);
  tower.position.set(cellSize * 1.6, 0, cellSize * 1.05);
  parking.position.set(cellSize * 1.8, 0.08, cellSize * 2);
  group.add(footprint, runway, taxiway, fenceGroup, terminal, tower, parking);
  group.add(createPlane(-cellSize * 1.7, -cellSize * 2.1, 0), createPlane(cellSize * 1.3, -cellSize * 2.1, Math.PI));
  group.add(createPlane(-cellSize * 0.2, -cellSize * 0.9, Math.PI / 2));
  addRunwayLines(group);
  group.scale.set(1, 1, 1);
  return group;
};

const createAirportFence = (width: number, depth: number) => {
  const group = new THREE.Group();
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  group.add(createFenceSegment(width, 0, -halfDepth));
  group.add(createFenceSegment(width, 0, halfDepth));
  group.add(createFenceSegment(depth, -halfWidth, 0, Math.PI / 2));
  group.add(createFenceSegment(depth, halfWidth, 0, Math.PI / 2));
  group.add(createBox(1.55, 0.68, 0.16, gate.color.getHex(), -0.88, 0.42, halfDepth + 0.04));
  group.add(createBox(1.55, 0.68, 0.16, gate.color.getHex(), 0.88, 0.42, halfDepth + 0.04));
  for (let index = 0; index <= 8; index += 1) {
    const x = -halfWidth + index * (width / 8);
    group.add(createFencePost(x, -halfDepth));
    group.add(createFencePost(x, halfDepth));
  }
  for (let index = 1; index < 6; index += 1) {
    const z = -halfDepth + index * (depth / 6);
    group.add(createFencePost(-halfWidth, z));
    group.add(createFencePost(halfWidth, z));
  }
  return group;
};

const createFenceSegment = (length: number, x: number, z: number, rotation = 0) => {
  const group = new THREE.Group();
  group.add(createBox(length, 0.12, 0.08, fence.color.getHex(), 0, 0.72, 0));
  group.add(createBox(length, 0.12, 0.08, fence.color.getHex(), 0, 0.28, 0));
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  return group;
};

const createFencePost = (x: number, z: number) => createBox(0.14, 1.05, 0.14, fence.color.getHex(), x, 0.54, z);

export const createStation = () => {
  const group = new THREE.Group();
  const base = createBox(cellSize * 4.8, 0.08, cellSize * 2.6, 0x8f8b80, 0, 0.08, 0);
  const hall = createBox(2.8, 1.15, 1.22, 0xb98f62, -1.25, 0.68, 0.32);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.48, 4), new THREE.MeshLambertMaterial({ color: 0x6c5542 }));
  const platformA = createBox(cellSize * 4.4, 0.12, 0.42, 0xb8b1a5, 0.15, 0.18, -0.72);
  const platformB = createBox(cellSize * 4.4, 0.12, 0.42, 0xb8b1a5, 0.15, 0.18, -1.35);
  const railA = createBox(cellSize * 4.6, 0.05, 0.06, 0x303638, 0.1, 0.28, -1.03);
  const railB = createBox(cellSize * 4.6, 0.05, 0.06, 0x303638, 0.1, 0.28, -0.78);
  const railC = createBox(cellSize * 4.6, 0.05, 0.06, 0x303638, 0.1, 0.28, -1.66);
  const railD = createBox(cellSize * 4.6, 0.05, 0.06, 0x303638, 0.1, 0.28, -1.41);
  const train = createTrain();
  train.position.set(1.2, 0, -1.03);
  roof.position.set(-1.25, 1.5, 0.32);
  roof.rotation.y = Math.PI / 4;
  group.add(base, hall, roof, platformA, platformB, railA, railB, railC, railD, train);
  return group;
};

const createTrain = () => {
  const group = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const wagon = createBox(1.25, 0.38, 0.32, index === 0 ? 0x2f7d68 : 0x3f8f79, index * 1.22 - 1.2, 0.5, 0);
    const window = createBox(0.82, 0.12, 0.035, 0xa4d6df, index * 1.22 - 1.2, 0.58, -0.18);
    group.add(wagon, window);
  }
  return group;
};

const createTerminal = () => {
  const group = new THREE.Group();
  const body = createBox(3.8, 0.85, 1.25, 0xd9e3e7, 0, 0.48, 0);
  const windows = createBox(3.55, 0.28, 0.05, 0x79bad0, 0, 0.68, -0.65);
  const bridgeA = createBox(0.26, 0.18, 1.15, 0xb8c5c9, -1.15, 0.42, -1.05);
  const bridgeB = createBox(0.26, 0.18, 1.15, 0xb8c5c9, 1.15, 0.42, -1.05);
  group.add(body, windows, bridgeA, bridgeB);
  return group;
};

const createTower = () => {
  const group = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 2.1, 12), concrete);
  const cabin = createBox(0.72, 0.38, 0.72, 0x9fc7d0, 0, 2.18, 0);
  shaft.position.y = 1.15;
  group.add(shaft, cabin);
  return group;
};

const createParking = () => {
  const group = new THREE.Group();
  group.add(createBox(2.6, 0.035, 1.25, 0x4b5254, 0, 0, 0));
  for (let index = 0; index < 8; index += 1) {
    const x = (index % 4) * 0.52 - 0.78;
    const z = Math.floor(index / 4) * 0.46 - 0.23;
    group.add(createBox(0.32, 0.12, 0.18, index % 2 ? 0xb84f4f : 0x4f79b8, x, 0.12, z));
    group.add(createBox(0.04, 0.02, 1.05, 0xffffff, x + 0.24, 0.04, 0));
  }
  return group;
};

const addRunwayLines = (group: THREE.Group) => {
  group.add(createBox(cellSize * 6.2, 0.025, 0.07, 0xffffff, 0, 0.14, -cellSize * 2.1));
  for (let index = 0; index < 7; index += 1) {
    group.add(createBox(0.36, 0.025, 0.08, 0xffffff, index * 1.45 - 4.35, 0.15, -cellSize * 2.1));
  }
  group.add(createBox(cellSize * 5.2, 0.025, 0.055, line.color.getHex(), -0.1, 0.14, -cellSize * 0.9));
};

const createPlane = (x: number, z: number, rotation: number) => {
  const plane = new THREE.Group();
  const body = createBox(1.45, 0.16, 0.16, 0xf4f7f8, 0, 0.3, 0);
  const wing = createBox(0.44, 0.04, 1.22, 0xd8e1e4, 0, 0.32, 0);
  const tail = createBox(0.18, 0.34, 0.06, 0xd64242, 0.64, 0.44, 0);
  plane.position.set(x, 0, z);
  plane.rotation.y = rotation;
  plane.add(body, wing, tail);
  return plane;
};

const createBox = (width: number, height: number, depth: number, color: number, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(x, y, z);
  return mesh;
};
