import * as THREE from 'three';
import type { FireEffect } from './cityIncidents3d';

const black = new THREE.MeshLambertMaterial({ color: 0x111416 });
const darkGlass = new THREE.MeshLambertMaterial({ color: 0x263238 });
const metal = new THREE.MeshLambertMaterial({ color: 0x2d3336 });
const clothes = new THREE.MeshLambertMaterial({ color: 0x202523 });
const skin = new THREE.MeshLambertMaterial({ color: 0xb98a64 });
const warning = new THREE.MeshBasicMaterial({ color: 0xb72e35, transparent: true, opacity: 0.34 });

export const addTerrorModel = (group: THREE.Group, effect: FireEffect) => {
  const pulse = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.035, 8, 36), warning);
  pulse.rotation.x = Math.PI / 2;
  pulse.position.y = 0.08;
  group.add(pulse);
  effect.movers.push(pulse);

  [
    [-0.95, -0.55, 0.12],
    [0.85, -0.45, -0.22],
    [0.05, 0.82, Math.PI],
  ].forEach(([x, z, rotation]) => group.add(createBlackCar(x, z, rotation)));

  [
    [-1.35, 0.35, -0.35],
    [-0.55, 0.28, 0.25],
    [0.65, 0.28, -0.2],
    [1.25, 0.35, 0.42],
  ].forEach(([x, z, rotation]) => group.add(createArmedPerson(x, z, rotation)));
};

const createBlackCar = (x: number, z: number, rotation: number) => {
  const group = new THREE.Group();
  group.add(part(1.2, 0.28, 0.58, black, 0, 0.24, 0));
  group.add(part(0.48, 0.28, 0.42, darkGlass, -0.04, 0.5, 0));
  group.add(part(0.35, 0.16, 0.5, black, -0.48, 0.36, 0));
  group.add(part(0.3, 0.14, 0.5, black, 0.5, 0.34, 0));
  [-0.44, 0.44].forEach((wheelX) => [-0.34, 0.34].forEach((wheelZ) => group.add(part(0.16, 0.16, 0.08, metal, wheelX, 0.08, wheelZ))));
  group.position.set(x, 0.08, z);
  group.rotation.y = rotation;
  return group;
};

const createArmedPerson = (x: number, z: number, rotation: number) => {
  const group = new THREE.Group();
  group.add(part(0.16, 0.44, 0.12, clothes, 0, 0.32, 0));
  group.add(part(0.16, 0.14, 0.14, skin, 0, 0.64, 0));
  group.add(part(0.48, 0.06, 0.06, metal, -0.22, 0.45, -0.08));
  group.add(part(0.12, 0.16, 0.06, metal, -0.46, 0.43, -0.08));
  group.position.set(x, 0.08, z);
  group.rotation.y = rotation;
  return group;
};

const part = (width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
};
