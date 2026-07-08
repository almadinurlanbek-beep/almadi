import * as THREE from 'three';

export const createFactory = () => {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.45, 1.45, 2.15),
    new THREE.MeshLambertMaterial({ color: 0x8f897d }),
  );
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(3.68, 0.22, 2.35),
    new THREE.MeshLambertMaterial({ color: 0x5f625f }),
  );
  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 1.85, 10),
    new THREE.MeshLambertMaterial({ color: 0x6c6760 }),
  );
  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.55, 8),
    new THREE.MeshLambertMaterial({ color: 0xb9b1a3 }),
  );
  const sideBlock = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 0.86, 1.42),
    new THREE.MeshLambertMaterial({ color: 0x7d827b }),
  );
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(4.35, 0.08, 2.82),
    new THREE.MeshLambertMaterial({ color: 0xa9aca5 }),
  );
  pad.position.y = 0.04;
  base.position.y = 0.72;
  roof.position.y = 1.55;
  sideBlock.position.set(1.1, 0.44, 0.48);
  chimney.position.set(1.18, 2.38, -0.64);
  pipe.position.set(-1.18, 2.05, 0.58);
  group.add(pad, base, roof, sideBlock, chimney, pipe, createFactoryWindows());
  return group;
};

const createFactoryWindows = () => {
  const windows = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xf2d27a });
  for (let row = 0; row < 2; row += 1) {
    for (let index = 0; index < 5; index += 1) {
      const window = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.04), material);
      window.position.set(-1.24 + index * 0.62, 0.62 + row * 0.44, -1.09);
      windows.add(window);
    }
  }
  return windows;
};
