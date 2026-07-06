import * as THREE from 'three';
import type { MapTile } from './cityMap';

const mat = (color: number) => new THREE.MeshLambertMaterial({ color });

export const createRareBuilding = (model: MapTile['model']) => {
  if (model === 'stadium') return createStadium();
  if (model === 'university') return createUniversity();
  if (model === 'bank') return createBank();
  if (model === 'port') return createPort();
  return createMuseum();
};

const createStadium = () => {
  const group = new THREE.Group();
  const field = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.08, 3), mat(0x4d9b55));
  const seats = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.38, 10, 56), mat(0xb84a42));
  const innerTrack = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.08, 8, 56), mat(0xe1b15b));
  const lights = [-2.75, 2.75].flatMap((x) => [-1.75, 1.75].map((z) => post(x, z, 2.8)));
  field.position.y = 0.08;
  seats.scale.z = 0.68;
  seats.rotation.x = Math.PI / 2;
  seats.position.y = 0.5;
  innerTrack.scale.z = 0.6;
  innerTrack.rotation.x = Math.PI / 2;
  innerTrack.position.y = 0.18;
  group.add(field, seats, innerTrack, box(5.4, 0.18, 3.7, 0x8f3b37, 0, 0.09, 0), ...lights);
  group.scale.set(1.28, 1.28, 1.28);
  return group;
};

const createUniversity = () => {
  const group = new THREE.Group();
  group.add(box(4.8, 1.55, 1.55, 0xcfa96a, 0, 0.78, 0));
  group.add(box(1.35, 2.25, 1.35, 0xb88b55, -2.1, 1.12, 0.28));
  group.add(box(1.35, 2.25, 1.35, 0xb88b55, 2.1, 1.12, 0.28));
  group.add(box(5.2, 0.28, 1.85, 0x5d6870, 0, 1.68, 0));
  group.add(box(1.2, 0.5, 0.9, 0x8f3b37, 0, 2.08, 0));
  group.add(cylinder(0.18, 1.55, 0xf0e6cf, -0.5, 0.86, -0.9));
  group.add(cylinder(0.18, 1.55, 0xf0e6cf, 0.5, 0.86, -0.9));
  group.add(box(1.6, 0.16, 1, 0xb88b55, 0, 0.08, -1.15));
  for (let i = 0; i < 8; i += 1) group.add(box(0.18, 1.06, 0.14, 0xf0e6cf, -1.75 + i * 0.5, 0.72, -0.84));
  return group;
};

const createBank = () => {
  const group = new THREE.Group();
  group.add(box(3.8, 1.65, 1.8, 0xd9d2bf, 0, 0.82, 0));
  group.add(box(4.2, 0.34, 2.05, 0xb7ad94, 0, 1.82, 0));
  group.add(box(4.35, 0.22, 2.18, 0x8f856f, 0, 0.11, 0));
  group.add(box(1.25, 0.16, 0.16, 0x2c3b45, 0, 1.08, -1.02));
  for (let i = 0; i < 6; i += 1) group.add(cylinder(0.12, 1.38, 0xf6eedb, -1.45 + i * 0.58, 0.82, -1));
  return group;
};

const createPort = () => {
  const group = new THREE.Group();
  group.add(box(5.8, 0.1, 3.8, 0x4ea8b5, 0, 0.05, 0));
  group.add(box(4.6, 0.2, 0.72, 0x7b5b3a, -0.25, 0.18, -0.4));
  group.add(box(1.2, 0.28, 0.46, 0xc65f3d, 1.55, 0.38, -1.02));
  group.add(box(1.2, 0.28, 0.46, 0xe0b84f, 0.2, 0.38, -1.02));
  group.add(box(1.2, 0.28, 0.46, 0x3f7fb0, -1.15, 0.38, -1.02));
  group.add(ship(-1.6, 0.9, 0xd85c4a, 1.45));
  group.add(ship(1.55, 0.82, 0x2f7d68, 1.25));
  group.add(crane(-2.35, -1.45));
  group.add(crane(2.35, -1.35));
  return group;
};

const createMuseum = () => {
  const group = new THREE.Group();
  group.add(box(5.35, 0.12, 3.55, 0x9f8a60, 0, 0.06, 0));
  group.add(box(4.75, 0.18, 2.72, 0xbfa878, 0, 0.2, 0.06));
  group.add(box(4.2, 1.36, 1.9, 0xe6d8bc, 0, 0.96, 0.18));
  group.add(box(4.65, 0.24, 2.18, 0xbfa878, 0, 1.76, 0.18));
  group.add(box(2.35, 0.34, 0.28, 0xa88f61, 0, 1.98, -0.93));
  group.add(box(1.65, 0.1, 0.72, 0xbfa878, 0, 0.36, -1.58));
  group.add(box(1.95, 0.1, 0.95, 0x9f8a60, 0, 0.2, -1.78));
  group.add(box(0.62, 0.72, 0.08, 0x4d3c2c, 0, 0.62, -0.82));
  group.add(dome(0, 2.04, 0.18));
  for (let i = 0; i < 6; i += 1) group.add(cylinder(0.12, 1.12, 0xf7efd9, -1.35 + i * 0.54, 0.84, -0.94));
  for (let i = 0; i < 4; i += 1) group.add(box(0.24, 0.28, 0.08, 0x8e744f, -1.35 + i * 0.9, 1.12, -0.83));
  return group;
};

const ship = (x: number, z: number, color: number, scale: number) => {
  const group = new THREE.Group();
  group.add(box(1.28, 0.28, 0.44, color, 0, 0.22, 0));
  group.add(box(0.48, 0.3, 0.32, 0xf1f4f2, 0.18, 0.48, 0));
  group.add(box(0.08, 0.68, 0.08, 0x30383b, -0.28, 0.78, 0));
  group.add(box(0.5, 0.04, 0.04, 0x30383b, -0.05, 1.06, 0));
  group.position.set(x, 0.08, z);
  group.scale.set(scale, scale, scale);
  return group;
};

const crane = (x: number, z: number) => {
  const group = new THREE.Group();
  group.add(box(0.16, 1.9, 0.16, 0xd7a43d, 0, 0.95, 0));
  group.add(box(1.25, 0.1, 0.1, 0xd7a43d, 0.48, 1.78, 0));
  group.add(box(0.08, 0.48, 0.08, 0x3a3f3c, 1.05, 1.5, 0));
  group.position.set(x, 0, z);
  return group;
};

const post = (x: number, z: number, height: number) => {
  const group = new THREE.Group();
  group.add(cylinder(0.035, height, 0x3a3f3c, 0, height / 2, 0));
  group.add(box(0.42, 0.12, 0.16, 0xfff2b8, 0, height + 0.04, 0));
  group.position.set(x, 0, z);
  return group;
};

const box = (w: number, h: number, d: number, color: number, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.position.set(x, y, z);
  return mesh;
};

const cylinder = (radius: number, height: number, color: number, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), mat(color));
  mesh.position.set(x, y, z);
  return mesh;
};

const dome = (x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.64, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x6f9f86));
  mesh.scale.y = 0.58;
  mesh.position.set(x, y, z);
  return mesh;
};
