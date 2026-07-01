import * as THREE from 'three';
import { createFireCrewRig } from './cityFireCrew3d';

const black = new THREE.MeshLambertMaterial({ color: 0x191d1f });

export const createPoliceCar = () => {
  const mesh = new THREE.Group();
  const body = createBox(1.36, 0.3, 0.62, 0xf5f7fb, 0, 0.25, 0);
  const hood = createBox(0.42, 0.18, 0.56, 0xf5f7fb, -0.52, 0.38, 0);
  const trunk = createBox(0.34, 0.18, 0.56, 0xf5f7fb, 0.55, 0.38, 0);
  const cabin = createBox(0.54, 0.32, 0.48, 0x8fd0e8, -0.03, 0.55, 0);
  const stripe = createBox(1.42, 0.07, 0.66, 0x244e91, 0, 0.39, 0);
  const light = createBox(0.28, 0.07, 0.16, 0xff3344, 0, 0.76, 0);
  mesh.add(body, hood, trunk, cabin, stripe, light, ...createLights(), ...createWheels(0.52, 0.36));
  return mesh;
};

export const createFireTruck = () => {
  const mesh = new THREE.Group();
  const crew = createFireCrewRig();
  const body = createBox(1.72, 0.5, 0.72, 0xc83d32, 0.16, 0.29, 0);
  const cab = createBox(0.58, 0.5, 0.68, 0xe85848, -0.66, 0.55, 0);
  const windshield = createBox(0.4, 0.18, 0.7, 0x9bd7e7, -0.82, 0.76, 0);
  const tank = createBox(0.8, 0.22, 0.56, 0xd84b3f, 0.36, 0.72, 0);
  const ladder = createBox(1.15, 0.08, 0.18, 0xd8dde0, 0.25, 0.95, 0);
  mesh.userData.crew = crew;
  mesh.add(body, cab, windshield, tank, ladder, crew.hose, crew.water, ...crew.firefighters, ...createWheels(0.66, 0.42));
  return mesh;
};

export const createAmbulance = () => {
  const mesh = new THREE.Group();
  const body = createBox(1.48, 0.5, 0.7, 0xf7f8f5, 0.05, 0.31, 0);
  const cab = createBox(0.5, 0.36, 0.62, 0xd9eef5, -0.48, 0.63, 0);
  const rear = createBox(0.72, 0.35, 0.66, 0xffffff, 0.32, 0.68, 0);
  const stripe = createBox(1.5, 0.08, 0.73, 0xd64242, 0.04, 0.49, 0);
  const crossVertical = createBox(0.08, 0.3, 0.75, 0xd64242, 0.38, 0.84, 0);
  const crossHorizontal = createBox(0.3, 0.08, 0.75, 0xd64242, 0.38, 0.84, 0);
  mesh.add(body, cab, rear, stripe, crossVertical, crossHorizontal, ...createLights(), ...createWheels(0.56, 0.39));
  return mesh;
};

export const createCivilianCar = (color: number) => {
  const mesh = new THREE.Group();
  const body = createBox(1.22, 0.28, 0.58, color, 0, 0.24, 0);
  const hood = createBox(0.36, 0.14, 0.5, color, -0.48, 0.36, 0);
  const cabin = createBox(0.48, 0.28, 0.42, 0x9fc7d6, 0.02, 0.52, 0);
  const trunk = createBox(0.3, 0.13, 0.5, color, 0.5, 0.36, 0);
  mesh.add(body, hood, cabin, trunk, ...createLights(), ...createWheels(0.48, 0.34));
  return mesh;
};

export const createPickupTruck = (color: number) => {
  const mesh = new THREE.Group();
  const body = createBox(1.42, 0.32, 0.62, color, -0.05, 0.27, 0);
  const cab = createBox(0.52, 0.34, 0.52, 0x9fc7d6, -0.38, 0.55, 0);
  const bed = createBox(0.58, 0.18, 0.56, 0x33383b, 0.42, 0.43, 0);
  mesh.add(body, cab, bed, ...createLights(), ...createWheels(0.56, 0.37));
  return mesh;
};

export const createCargoTruck = (color: number) => {
  const mesh = new THREE.Group();
  const cab = createBox(0.62, 0.5, 0.68, color, -0.78, 0.38, 0);
  const windshield = createBox(0.34, 0.18, 0.7, 0x9fc7d6, -0.95, 0.62, 0);
  const trailer = createBox(1.42, 0.58, 0.72, 0xd8dde0, 0.22, 0.42, 0);
  mesh.add(cab, windshield, trailer, ...createLights(), ...createWheels(0.82, 0.42));
  return mesh;
};

export const createVan = (color: number) => {
  const mesh = new THREE.Group();
  const body = createBox(1.38, 0.46, 0.66, color, 0, 0.33, 0);
  const windshield = createBox(0.28, 0.16, 0.62, 0x9fc7d6, -0.48, 0.58, 0);
  const rearWindow = createBox(0.24, 0.12, 0.62, 0x8fb8c6, 0.48, 0.58, 0);
  mesh.add(body, windshield, rearWindow, ...createLights(), ...createWheels(0.54, 0.38));
  return mesh;
};

export const createCompactCar = (color: number) => {
  const mesh = new THREE.Group();
  const body = createBox(1.02, 0.26, 0.54, color, 0, 0.23, 0);
  const cabin = createBox(0.42, 0.25, 0.42, 0x9fc7d6, -0.02, 0.48, 0);
  mesh.add(body, cabin, ...createLights(), ...createWheels(0.4, 0.32));
  return mesh;
};

const createBox = (width: number, height: number, depth: number, color: number, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(x, y, z);
  return mesh;
};

const createLights = () => [
  createBox(0.08, 0.08, 0.08, 0xfff0a6, -0.74, 0.32, -0.28),
  createBox(0.08, 0.08, 0.08, 0xfff0a6, -0.74, 0.32, 0.28),
];

export const createWheels = (x: number, z: number) => {
  return [-x, x].flatMap((wheelX) => [-z, z].map((wheelZ) => createWheel(wheelX, wheelZ)));
};

const createWheel = (x: number, z: number) => {
  const group = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 32), black);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.155, 24), new THREE.MeshLambertMaterial({ color: 0xb8c0c4 }));
  tire.rotation.x = Math.PI / 2;
  hub.rotation.x = Math.PI / 2;
  group.name = 'wheel';
  group.position.set(x, 0.05, z);
  group.userData.baseY = group.position.y;
  group.add(tire, hub);
  return group;
};
