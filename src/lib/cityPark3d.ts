import * as THREE from 'three';
import { cellSize } from './cityGrid3d';
import { createParkTree } from './cityVegetation3d';

const grass = new THREE.MeshLambertMaterial({ color: 0x6faa5b });
const path = new THREE.MeshLambertMaterial({ color: 0xd9c58f });
const water = new THREE.MeshBasicMaterial({ color: 0x5eb6cf, transparent: true, opacity: 0.72 });
const bench = new THREE.MeshLambertMaterial({ color: 0x7b5137 });
const dark = new THREE.MeshLambertMaterial({ color: 0x313635 });

export const createLargePark = () => {
  const group = new THREE.Group();
  const size = cellSize * 8.35;
  group.add(part(size, 0.07, size, grass, 0, 0.04, 0));
  group.add(part(size * 0.86, 0.04, 0.42, path, 0, 0.11, 0));
  group.add(part(0.42, 0.04, size * 0.86, path, 0, 0.12, 0));
  group.add(createFountain());
  addTrees(group);
  addBenches(group);
  return group;
};

const addTrees = (group: THREE.Group) => {
  const positions = [
    [-6.2, -6.0], [-4.4, -5.5], [-2.5, -6.2], [2.8, -6.0], [4.8, -5.6], [6.4, -4.8],
    [-6.1, -2.9], [-4.7, -1.8], [5.4, -2.4], [6.2, -0.4],
    [-6.4, 2.1], [-4.8, 4.2], [-2.8, 5.8], [2.8, 5.8], [5.0, 4.4], [6.3, 2.3],
  ] as const;
  positions.forEach(([x, z], index) => {
    const tree = createParkTree();
    tree.position.set(x, 0.08, z);
    tree.scale.setScalar(1.15 + (index % 3) * 0.18);
    group.add(tree);
  });
};

const addBenches = (group: THREE.Group) => {
  [
    [-1.5, -2.4, 0],
    [1.5, -2.4, 0],
    [-1.5, 2.4, Math.PI],
    [1.5, 2.4, Math.PI],
  ].forEach(([x, z, rotation]) => {
    const item = new THREE.Group();
    item.add(part(0.82, 0.14, 0.2, bench, 0, 0.34, 0));
    item.add(part(0.08, 0.32, 0.08, dark, -0.28, 0.18, 0));
    item.add(part(0.08, 0.32, 0.08, dark, 0.28, 0.18, 0));
    item.position.set(x, 0.08, z);
    item.rotation.y = rotation;
    group.add(item);
  });
};

const createFountain = () => {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.22, 24), new THREE.MeshLambertMaterial({ color: 0xbfc7c2 }));
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 0.1, 24), water);
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.1, 0.8, 10), water);
  base.position.y = 0.18;
  bowl.position.y = 0.36;
  jet.position.y = 0.78;
  group.add(base, bowl, jet);
  return group;
};

const part = (width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
};
