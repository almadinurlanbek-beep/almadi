import * as THREE from 'three';
import type { MapTile } from './cityMap';
import { createHospital } from './cityHospital3d';
import { createMilitaryBase } from './cityMilitaryBase3d';
import { createFireStation, createPoliceStation } from './cityServiceBuildings3d';

export const createBasicBuilding = (model: MapTile['model']) => {
  if (model === 'shop') return createShop();
  if (model === 'police') return createPoliceStation();
  if (model === 'fire') return createFireStation();
  if (model === 'hospital') return createHospital();
  if (model === 'military') return createMilitaryBase();
  const group = new THREE.Group();
  const colors: Partial<Record<MapTile['model'], number>> = {
    home: 0xf2d6b3,
    school: 0xd7a84f,
    hospital: 0xf3f6f7,
    police: 0x5276a8,
    fire: 0xb94438,
    mall: 0xd59ab5,
    shop: 0x8cc0d8,
  };
  const height = model === 'mall' ? 2.3 : 1.25;
  const width = model === 'mall' ? 3.4 : 1.25;
  const depth = model === 'mall' ? 2.8 : 1.25;
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshLambertMaterial({ color: colors[model] ?? 0xdddddd }),
  );
  base.position.y = height / 2;
  group.add(base);
  if (model === 'home') addHomeWindows(group);
  if (model === 'mall') addMallDetails(group);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.95, 0.55, 4),
    new THREE.MeshLambertMaterial({ color: model === 'home' ? 0x9d4c38 : 0x5d6870 }),
  );
  roof.position.y = height + 0.28;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  return group;
};

const addMallDetails = (group: THREE.Group) => {
  const glass = new THREE.MeshLambertMaterial({ color: 0x9bd3df, emissive: 0x376b78, emissiveIntensity: 0.25 });
  const doors = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.8, 0.04), glass);
  doors.position.set(0, 0.42, -1.42);
  group.add(doors);
  [-1.05, 0, 1.05].forEach((x) => {
    const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.04), glass);
    windowMesh.position.set(x, 1.35, -1.42);
    group.add(windowMesh);
  });
};

const createShop = () => {
  const group = new THREE.Group();
  const wall = new THREE.MeshLambertMaterial({ color: 0xf0d3a2 });
  const trim = new THREE.MeshLambertMaterial({ color: 0x3f6f89 });
  const glass = new THREE.MeshLambertMaterial({ color: 0x9bd3df, emissive: 0x376b78, emissiveIntensity: 0.22 });
  group.add(createPart(1.65, 1.15, 1.28, wall, 0, 0.58, 0));
  group.add(createPart(1.86, 0.16, 1.44, trim, 0, 1.24, 0));
  group.add(createPart(1.95, 0.14, 0.58, new THREE.MeshLambertMaterial({ color: 0xd94f42 }), 0, 1.05, -0.9));
  group.add(createPart(0.55, 0.78, 0.04, glass, -0.32, 0.42, -0.66));
  group.add(createPart(0.38, 0.78, 0.04, glass, 0.38, 0.42, -0.66));
  group.add(createShopSign());
  return group;
};

const createShopSign = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#fff7df';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#24313a';
    context.font = '700 34px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('МАГАЗИН', 128, 50);
  }
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 0.36, 0.04),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) }),
  );
  sign.position.set(0, 1.45, -0.72);
  return sign;
};

const createPart = (width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
};

const addHomeWindows = (group: THREE.Group) => {
  const lit = new THREE.MeshLambertMaterial({ color: 0xffd77a, emissive: 0xffb23f, emissiveIntensity: 0.8 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x263943 });
  const places = [
    [-0.34, 0.55, -0.63],
    [0.34, 0.55, -0.63],
    [-0.34, 0.92, -0.63],
    [0.34, 0.92, -0.63],
    [-0.63, 0.72, -0.32],
    [-0.63, 0.72, 0.32],
    [0.63, 0.72, -0.32],
    [0.63, 0.72, 0.32],
  ] as const;

  places.forEach(([x, y, z], index) => {
    const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.025), index % 3 === 0 ? dark : lit);
    windowMesh.position.set(x, y, z);
    windowMesh.rotation.y = Math.abs(x) > 0.6 ? Math.PI / 2 : 0;
    group.add(windowMesh);
  });
};
