import * as THREE from 'three';
import { cellSize, tileToPosition } from './cityGrid3d';

const bridgeRows = [4, 14, 24, 34, 44, 54, 64, 74];

export const createBridges = () => {
  const group = new THREE.Group();
  bridgeRows.forEach((y) => {
    const bridge = createBridge();
    bridge.position.copy(tileToPosition(36, y, 0.14));
    group.add(bridge);
  });
  return group;
};

const createBridge = () => {
  const group = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(cellSize * 4.2, 0.18, cellSize * 0.95), new THREE.MeshLambertMaterial({ color: 0x6a7173 }));
  const leftRail = createRail(-0.62);
  const rightRail = createRail(0.62);
  const archA = createArch(-1.55);
  const archB = createArch(1.55);
  deck.position.y = 0.14;
  group.add(deck, leftRail, rightRail, archA, archB);
  return group;
};

const createRail = (z: number) => {
  const rail = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ color: 0xd8dde0 });
  rail.add(new THREE.Mesh(new THREE.BoxGeometry(cellSize * 4, 0.08, 0.06), material));
  rail.children[0].position.set(0, 0.48, z);
  for (let index = 0; index < 6; index += 1) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.08), material);
    post.position.set(-3.3 + index * 1.32, 0.28, z);
    rail.add(post);
  }
  return rail;
};

const createArch = (x: number) => {
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(0.74, 0.035, 8, 24, Math.PI),
    new THREE.MeshLambertMaterial({ color: 0xf0e5c8 }),
  );
  arch.position.set(x, 0.46, 0);
  arch.rotation.set(Math.PI / 2, 0, Math.PI);
  arch.scale.x = 1.45;
  return arch;
};
