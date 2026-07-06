import * as THREE from 'three';
import { cellSize } from './cityGrid3d';

const concrete = new THREE.MeshLambertMaterial({ color: 0xaeb6b8 });
const line = new THREE.MeshLambertMaterial({ color: 0xf3d35b });
const fence = new THREE.MeshLambertMaterial({ color: 0x2f3638 });
const gate = new THREE.MeshLambertMaterial({ color: 0x59656a });

export const createAirport = () => {
  const group = new THREE.Group();
  const footprint = createBox(cellSize * 7.2, 0.04, cellSize * 6.2, 0x7f8d82, 0, 0.03, 0);
  const runway = createBox(cellSize * 7, 0.07, 0.88, 0x34393b, 0, 0.08, -cellSize * 2.1);
  const taxiway = createBox(cellSize * 5.8, 0.06, 0.54, 0x4a5052, -0.1, 0.1, -cellSize * 0.9);
  const terminal = createTerminal();
  const tower = createTower();
  const parking = createParking();
  const fenceGroup = createAirportFence(cellSize * 7.2, cellSize * 6.2);

  terminal.position.set(-cellSize * 1.2, 0, cellSize * 1.05);
  tower.position.set(cellSize * 1.9, 0, cellSize * 0.95);
  parking.position.set(cellSize * 1.85, 0.08, cellSize * 2.05);
  group.add(footprint, runway, taxiway, fenceGroup, terminal, tower, parking);
  group.add(createPlane(-cellSize * 1.95, -cellSize * 2.1, 0), createPlane(cellSize * 1.55, -cellSize * 2.1, Math.PI));
  group.add(createPlane(-cellSize * 0.15, -cellSize * 0.9, Math.PI / 2));
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
  const body = createBox(5.25, 1.28, 1.72, 0xd9e3e7, 0, 0.66, 0);
  const upper = createBox(3.85, 0.72, 1.22, 0xcbd8dc, -0.2, 1.56, 0.04);
  const windows = createBox(4.92, 0.42, 0.06, 0x79bad0, 0, 0.92, -0.89);
  const upperWindows = createBox(3.48, 0.28, 0.06, 0x79bad0, -0.2, 1.62, -0.6);
  const roof = createBox(5.55, 0.18, 1.96, 0x66727a, 0, 1.38, 0);
  const bridgeA = createBox(0.38, 0.25, 1.7, 0xb8c5c9, -1.62, 0.58, -1.45);
  const bridgeB = createBox(0.38, 0.25, 1.7, 0xb8c5c9, 1.62, 0.58, -1.45);
  group.add(body, upper, windows, upperWindows, roof, bridgeA, bridgeB);
  return group;
};

const createTower = () => {
  const group = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 3.1, 12), concrete);
  const cabin = createBox(1.12, 0.62, 1.12, 0x9fc7d0, 0, 3.24, 0);
  const roof = createBox(1.28, 0.16, 1.28, 0x59656a, 0, 3.64, 0);
  shaft.position.y = 1.62;
  group.add(shaft, cabin, roof);
  return group;
};

const createParking = () => {
  const group = new THREE.Group();
  group.add(createBox(3.55, 0.04, 1.74, 0x4b5254, 0, 0, 0));
  for (let index = 0; index < 8; index += 1) {
    const x = (index % 4) * 0.72 - 1.08;
    const z = Math.floor(index / 4) * 0.62 - 0.31;
    group.add(createBox(0.44, 0.16, 0.25, index % 2 ? 0xb84f4f : 0x4f79b8, x, 0.14, z));
    group.add(createBox(0.05, 0.025, 1.45, 0xffffff, x + 0.34, 0.045, 0));
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
  const body = createBox(2.25, 0.24, 0.24, 0xf4f7f8, 0, 0.36, 0);
  const nose = createBox(0.28, 0.2, 0.2, 0xe7eef0, -1.24, 0.36, 0);
  const wing = createBox(0.68, 0.06, 1.88, 0xd8e1e4, -0.08, 0.38, 0);
  const tailWing = createBox(0.28, 0.05, 0.9, 0xd8e1e4, 0.94, 0.45, 0);
  const tail = createBox(0.24, 0.54, 0.08, 0xd64242, 1.02, 0.62, 0);
  plane.position.set(x, 0, z);
  plane.rotation.y = rotation;
  plane.add(body, nose, wing, tailWing, tail);
  return plane;
};

const createBox = (width: number, height: number, depth: number, color: number, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(x, y, z);
  return mesh;
};
