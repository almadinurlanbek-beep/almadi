import * as THREE from 'three';

const white = new THREE.MeshLambertMaterial({ color: 0xf5f7f8 });
const glass = new THREE.MeshLambertMaterial({ color: 0x8fc7d9, emissive: 0x356273, emissiveIntensity: 0.18 });
const red = new THREE.MeshLambertMaterial({ color: 0xd63838 });
const roof = new THREE.MeshLambertMaterial({ color: 0x66727a });
const asphalt = new THREE.MeshLambertMaterial({ color: 0x4f5658 });
const fence = new THREE.MeshLambertMaterial({ color: 0x59656a });
const dark = new THREE.MeshLambertMaterial({ color: 0x242a2d });

export const createHospital = () => {
  const group = new THREE.Group();
  group.add(part(6.9, 0.06, 5.5, 0xbfc9c5, 0, 0.04, 0));
  group.add(part(2.2, 0.04, 4.1, asphalt, 2.05, 0.1, -0.15));
  group.add(createFence(6.9, 5.5));
  group.add(createMainBuilding());
  group.add(createSideWing(-1.95, 0.55));
  group.add(createSideWing(1.95, 0.55));
  group.add(createAmbulance(2.25, -1.55, Math.PI / 2));
  group.add(createAmbulance(2.25, -0.35, Math.PI / 2));
  group.add(createServiceVan(2.25, 1.0, Math.PI / 2));
  group.scale.set(0.72, 0.86, 0.72);
  return group;
};

const createMainBuilding = () => {
  const group = new THREE.Group();
  group.add(part(2.2, 3.05, 1.55, white, 0, 1.58, 0.35));
  group.add(part(2.35, 0.22, 1.72, roof, 0, 3.2, 0.35));
  group.add(part(0.26, 1.08, 0.08, red, 0, 2.15, -0.46));
  group.add(part(0.86, 0.26, 0.08, red, 0, 2.15, -0.47));
  addWindowGrid(group, 0, -0.48, 3, 3);
  return group;
};

const createSideWing = (x: number, z: number) => {
  const group = new THREE.Group();
  group.add(part(1.7, 1.65, 1.7, white, 0, 0.86, 0));
  group.add(part(1.84, 0.18, 1.84, roof, 0, 1.78, 0));
  addWindowGrid(group, 0, -0.88, 2, 2);
  group.position.set(x, 0.08, z);
  return group;
};

const addWindowGrid = (group: THREE.Group, centerX: number, z: number, columns: number, rows: number) => {
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = centerX + (column - (columns - 1) / 2) * 0.48;
      const y = 0.92 + row * 0.58;
      group.add(part(0.26, 0.2, 0.04, glass, x, y, z));
    }
  }
};

const createFence = (width: number, depth: number) => {
  const group = new THREE.Group();
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  group.add(part(width, 0.16, 0.08, fence, 0, 0.42, -halfDepth));
  group.add(part(width, 0.16, 0.08, fence, 0, 0.42, halfDepth));
  group.add(part(0.08, 0.16, depth, fence, -halfWidth, 0.42, 0));
  group.add(part(0.08, 0.16, depth, fence, halfWidth, 0.42, 0));
  [-halfWidth, -1.7, 0, 1.7, halfWidth].forEach((x) => {
    group.add(part(0.12, 0.72, 0.12, fence, x, 0.38, -halfDepth));
    group.add(part(0.12, 0.72, 0.12, fence, x, 0.38, halfDepth));
  });
  [-halfDepth, 0, halfDepth].forEach((z) => {
    group.add(part(0.12, 0.72, 0.12, fence, -halfWidth, 0.38, z));
    group.add(part(0.12, 0.72, 0.12, fence, halfWidth, 0.38, z));
  });
  return group;
};

const createAmbulance = (x: number, z: number, rotation: number) => {
  const group = new THREE.Group();
  group.add(part(0.82, 0.34, 0.46, white, 0, 0.26, 0));
  group.add(part(0.32, 0.28, 0.42, glass, -0.28, 0.48, 0));
  group.add(part(0.08, 0.24, 0.5, red, 0.16, 0.52, 0));
  group.add(part(0.3, 0.08, 0.5, red, 0.16, 0.52, 0));
  addWheels(group, 0.28, 0.27);
  group.position.set(x, 0.1, z);
  group.rotation.y = rotation;
  return group;
};

const createServiceVan = (x: number, z: number, rotation: number) => {
  const group = new THREE.Group();
  group.add(part(0.92, 0.34, 0.46, 0xdce4e6, 0, 0.26, 0));
  group.add(part(0.3, 0.22, 0.42, glass, -0.28, 0.48, 0));
  addWheels(group, 0.32, 0.27);
  group.position.set(x, 0.1, z);
  group.rotation.y = rotation;
  return group;
};

const addWheels = (group: THREE.Group, xOffset: number, zOffset: number) => {
  [-xOffset, xOffset].forEach((wheelX) => {
    [-zOffset, zOffset].forEach((wheelZ) => group.add(part(0.12, 0.12, 0.08, dark, wheelX, 0.1, wheelZ)));
  });
};

const part = (width: number, height: number, depth: number, material: THREE.Material | number, x: number, y: number, z: number) => {
  const usedMaterial = typeof material === 'number' ? new THREE.MeshLambertMaterial({ color: material }) : material;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), usedMaterial);
  mesh.position.set(x, y, z);
  return mesh;
};
