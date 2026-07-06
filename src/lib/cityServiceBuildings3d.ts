import * as THREE from 'three';

const brick = new THREE.MeshLambertMaterial({ color: 0xb64a3b });
const concrete = new THREE.MeshLambertMaterial({ color: 0xd9dee2 });
const dark = new THREE.MeshLambertMaterial({ color: 0x252b2f });
const glass = new THREE.MeshLambertMaterial({ color: 0x9bd3df, emissive: 0x376b78, emissiveIntensity: 0.2 });
const policeBlue = new THREE.MeshLambertMaterial({ color: 0x244e91 });
const fireRed = new THREE.MeshLambertMaterial({ color: 0xc9362d });
const yellow = new THREE.MeshLambertMaterial({ color: 0xf2c94c });
const white = new THREE.MeshLambertMaterial({ color: 0xf7f1dd });

export const createPoliceStation = () => {
  const group = new THREE.Group();
  group.add(part(3.25, 1.45, 2.08, concrete, 0, 0.74, 0));
  group.add(part(3.48, 0.22, 2.26, policeBlue, 0, 1.58, 0));
  group.add(part(1.05, 2.25, 1.05, concrete, 1.33, 1.14, 0.2));
  group.add(part(0.82, 0.56, 1.08, glass, 1.33, 1.86, 0.2));
  group.add(part(0.18, 0.18, 0.18, policeBlue, 1.33, 2.35, 0.2));
  addGarageDoors(group, policeBlue);
  group.add(part(0.48, 0.9, 0.08, dark, -1.22, 0.48, -1.08));
  group.add(part(0.46, 0.44, 0.08, glass, -0.52, 0.9, -1.08));
  group.add(part(0.46, 0.44, 0.08, glass, 0.12, 0.9, -1.08));
  group.add(createSign('POLICE', 0x244e91, 1.82, -1.18));
  group.add(createShield(-1.25, 1.38, -1.16));
  group.add(createFlagPole(1.78, -0.94));
  group.add(createPoliceCar(-0.2, -1.75));
  group.scale.set(1.28, 1.35, 1.28);
  return group;
};

export const createFireStation = () => {
  const group = new THREE.Group();
  group.add(part(3.45, 1.5, 2.18, brick, 0, 0.76, 0));
  group.add(part(3.68, 0.24, 2.36, dark, 0, 1.64, 0));
  group.add(part(1.06, 2.65, 1.0, brick, 1.42, 1.34, 0.16));
  group.add(part(0.84, 0.64, 1.02, glass, 1.42, 2.18, 0.16));
  group.add(part(0.22, 0.22, 0.22, fireRed, 1.42, 2.82, 0.16));
  addGarageDoors(group, fireRed);
  group.add(part(0.52, 0.42, 0.08, glass, -1.22, 1.0, -1.13));
  group.add(part(0.52, 0.42, 0.08, glass, -0.52, 1.0, -1.13));
  group.add(createSign('FIRE', 0xc9362d, 1.86, -1.2));
  group.add(createFireTruck(-0.08, -1.82));
  group.scale.set(1.28, 1.35, 1.28);
  return group;
};

const addGarageDoors = (group: THREE.Group, accent: THREE.Material) => {
  [-0.46, 0.48].forEach((x) => {
    group.add(part(0.82, 1.02, 0.12, dark, x, 0.57, -1.16));
    group.add(part(0.66, 0.84, 0.14, accent, x, 0.52, -1.23));
    group.add(part(0.62, 0.06, 0.15, white, x, 0.76, -1.31));
    group.add(part(0.62, 0.06, 0.15, white, x, 0.47, -1.31));
  });
};

const createPoliceCar = (x: number, z: number) => {
  const group = new THREE.Group();
  group.add(part(0.9, 0.24, 0.46, white, 0, 0.2, 0));
  group.add(part(0.42, 0.22, 0.38, policeBlue, -0.06, 0.42, 0));
  group.add(part(0.18, 0.08, 0.12, fireRed, -0.1, 0.58, 0));
  group.add(part(0.18, 0.08, 0.12, policeBlue, 0.12, 0.58, 0));
  addWheels(group, 0.32, 0.3);
  group.position.set(x, 0.08, z);
  return group;
};

const createFireTruck = (x: number, z: number) => {
  const group = new THREE.Group();
  group.add(part(1.28, 0.34, 0.58, fireRed, 0, 0.28, 0));
  group.add(part(0.42, 0.38, 0.56, white, -0.42, 0.48, 0));
  group.add(part(1.08, 0.08, 0.1, yellow, 0.2, 0.68, -0.34));
  group.add(part(0.18, 0.18, 0.62, dark, 0.62, 0.48, 0));
  addWheels(group, 0.46, 0.38);
  group.position.set(x, 0.08, z);
  return group;
};

const addWheels = (group: THREE.Group, xOffset: number, zOffset: number) => {
  [-xOffset, xOffset].forEach((wheelX) => {
    [-zOffset, zOffset].forEach((wheelZ) => group.add(part(0.16, 0.16, 0.1, dark, wheelX, 0.1, wheelZ)));
  });
};

const createShield = (x: number, y: number, z: number) => {
  const group = new THREE.Group();
  group.add(part(0.48, 0.44, 0.06, policeBlue, 0, 0, 0));
  group.add(part(0.28, 0.28, 0.07, yellow, 0, 0.02, -0.01));
  group.rotation.z = Math.PI / 4;
  group.position.set(x, y, z);
  return group;
};

const createFlagPole = (x: number, z: number) => {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8), dark);
  pole.position.y = 0.75;
  group.add(pole, part(0.48, 0.26, 0.04, policeBlue, 0.25, 1.22, 0));
  group.position.set(x, 0.24, z);
  return group;
};

const createSign = (text: string, color: number, y: number, z: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#fff7df';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.font = '800 38px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 50);
  }
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.36, 0.04), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) }));
  sign.position.set(0, y, z);
  return sign;
};

const part = (width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
};
