import * as THREE from 'three';
import { cellSize } from './cityGrid3d';

const ground = new THREE.MeshLambertMaterial({ color: 0x74835a });
const asphalt = new THREE.MeshLambertMaterial({ color: 0x4b5149 });
const wall = new THREE.MeshLambertMaterial({ color: 0x687057 });
const roof = new THREE.MeshLambertMaterial({ color: 0x2f3a2b });
const metal = new THREE.MeshLambertMaterial({ color: 0x777f7d });
const dark = new THREE.MeshLambertMaterial({ color: 0x252b2a });
const uniform = new THREE.MeshLambertMaterial({ color: 0x3f5137 });
const skin = new THREE.MeshLambertMaterial({ color: 0xc99b72 });

export const createMilitaryBase = () => {
  const group = new THREE.Group();
  const size = cellSize * 8.15;
  group.add(part(size, 0.08, size, ground, 0, 0.03, 0));
  group.add(part(size * 0.86, 0.035, 1.25, asphalt, 0, 0.09, -size * 0.28));
  group.add(part(1.05, 0.035, size * 0.72, asphalt, -size * 0.18, 0.1, 0));
  group.add(createFence(size));
  group.add(createGate(0, -size / 2));
  group.add(createBarracks(-5.2, 3.7, 3.3, 2.0, 1.35));
  group.add(createBarracks(-1.2, 3.7, 3.3, 2.0, 1.35));
  group.add(createCommand(3.8, 3.1));
  group.add(createHangar(4.2, -1.2));
  group.add(createHangar(4.2, -4.2));
  group.add(createTower(-7.2, -7.2));
  group.add(createTower(7.2, -7.2));
  group.add(createTower(-7.2, 7.2));
  group.add(createTower(7.2, 7.2));
  group.add(createTank(-5.4, -3.1, Math.PI / 10));
  group.add(createTank(-3.1, -5.0, -Math.PI / 8));
  group.add(createTank(0.1, -4.2, Math.PI / 16));
  group.add(createTruck(-1.7, -1.1, Math.PI / 2));
  group.add(createTruck(1.0, -1.1, Math.PI / 2));
  [-6, -4.8, -3.6, -2.4, -1.2, 0].forEach((x, index) => group.add(createSoldier(x, 6.2 - (index % 2) * 0.45)));
  return group;
};

const createFence = (size: number) => {
  const group = new THREE.Group();
  group.add(part(size, 0.52, 0.12, dark, 0, 0.3, -size / 2));
  group.add(part(size, 0.52, 0.12, dark, 0, 0.3, size / 2));
  group.add(part(0.12, 0.52, size, dark, -size / 2, 0.3, 0));
  group.add(part(0.12, 0.52, size, dark, size / 2, 0.3, 0));
  return group;
};

const createGate = (x: number, z: number) => {
  const group = new THREE.Group();
  group.add(part(0.28, 1.35, 0.26, metal, -1.25, 0.72, 0));
  group.add(part(0.28, 1.35, 0.26, metal, 1.25, 0.72, 0));
  group.add(part(2.9, 0.2, 0.22, metal, 0, 1.42, 0));
  group.add(part(0.95, 0.56, 0.18, wall, -0.52, 0.42, 0.08));
  group.add(part(0.95, 0.56, 0.18, wall, 0.52, 0.42, 0.08));
  group.position.set(x, 0, z + 0.06);
  return group;
};

const createBarracks = (x: number, z: number, width: number, depth: number, height: number) => {
  const group = new THREE.Group();
  group.add(part(width, height, depth, wall, 0, height / 2, 0));
  group.add(part(width + 0.35, 0.22, depth + 0.35, roof, 0, height + 0.14, 0));
  [-0.9, 0, 0.9].forEach((windowX) => group.add(part(0.36, 0.36, 0.04, metal, windowX, 0.7, -depth / 2 - 0.03)));
  group.add(part(0.48, 0.72, 0.05, dark, 0, 0.38, depth / 2 + 0.03));
  group.position.set(x, 0.08, z);
  return group;
};

const createCommand = (x: number, z: number) => {
  const group = createBarracks(0, 0, 2.8, 2.45, 1.95);
  group.add(part(0.22, 1.5, 0.22, dark, 1.15, 2.45, -0.9));
  group.add(part(0.9, 0.18, 0.42, roof, 1.5, 3.1, -0.9));
  group.position.set(x, 0.08, z);
  return group;
};

const createHangar = (x: number, z: number) => {
  const group = new THREE.Group();
  group.add(part(3.35, 1.45, 2.7, metal, 0, 0.78, 0));
  group.add(part(2.45, 1.0, 0.12, dark, 0, 0.55, -1.42));
  group.add(part(3.7, 0.28, 3.05, roof, 0, 1.6, 0));
  group.add(part(1.7, 0.3, 0.32, uniform, 0.08, 0.24, -1.78));
  group.position.set(x, 0.08, z);
  return group;
};

const createTower = (x: number, z: number) => {
  const group = new THREE.Group();
  [-0.28, 0.28].forEach((dx) => [-0.28, 0.28].forEach((dz) => group.add(part(0.12, 2.25, 0.12, dark, dx, 1.18, dz))));
  group.add(part(1.0, 0.18, 1.0, metal, 0, 2.35, 0));
  group.add(part(0.72, 0.48, 0.72, wall, 0, 2.68, 0));
  group.add(part(0.88, 0.16, 0.88, roof, 0, 3.02, 0));
  group.position.set(x, 0.08, z);
  return group;
};

const createTank = (x: number, z: number, rotation: number) => {
  const group = new THREE.Group();
  group.add(part(1.55, 0.45, 1.0, uniform, 0, 0.38, 0));
  group.add(part(0.82, 0.42, 0.64, wall, -0.08, 0.78, 0));
  group.add(part(1.25, 0.13, 0.13, dark, -0.86, 0.88, 0));
  group.add(part(1.7, 0.22, 0.18, dark, 0, 0.18, -0.58));
  group.add(part(1.7, 0.22, 0.18, dark, 0, 0.18, 0.58));
  group.position.set(x, 0.08, z);
  group.rotation.y = rotation;
  return group;
};

const createTruck = (x: number, z: number, rotation: number) => {
  const group = new THREE.Group();
  group.add(part(1.55, 0.55, 0.82, wall, 0.1, 0.46, 0));
  group.add(part(0.7, 0.62, 0.78, uniform, -0.72, 0.56, 0));
  [-0.48, 0.58].forEach((wheelX) => [-0.52, 0.52].forEach((wheelZ) => group.add(part(0.28, 0.28, 0.18, dark, wheelX, 0.2, wheelZ))));
  group.position.set(x, 0.08, z);
  group.rotation.y = rotation;
  return group;
};

const createSoldier = (x: number, z: number) => {
  const group = new THREE.Group();
  group.add(part(0.18, 0.52, 0.14, uniform, 0, 0.36, 0));
  group.add(part(0.18, 0.16, 0.16, skin, 0, 0.72, 0));
  group.add(part(0.28, 0.09, 0.22, roof, 0, 0.84, 0));
  group.position.set(x, 0.08, z);
  return group;
};

const part = (width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
};
