import * as THREE from 'three';

export const createFactory = () => {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 1.1, 1.25),
    new THREE.MeshLambertMaterial({ color: 0x8f897d }),
  );
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.18, 1.35),
    new THREE.MeshLambertMaterial({ color: 0x5f625f }),
  );
  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.18, 1.35, 10),
    new THREE.MeshLambertMaterial({ color: 0x6c6760 }),
  );
  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8),
    new THREE.MeshLambertMaterial({ color: 0xb9b1a3 }),
  );
  base.position.y = 0.55;
  roof.position.y = 1.18;
  chimney.position.set(0.5, 1.85, -0.34);
  pipe.position.set(-0.45, 1.55, 0.36);
  group.add(base, roof, chimney, pipe, createFactoryWindows());
  return group;
};

const createFactoryWindows = () => {
  const windows = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xf2d27a });
  for (let index = 0; index < 4; index += 1) {
    const window = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.04), material);
    window.position.set(-0.5 + index * 0.34, 0.72, -0.64);
    windows.add(window);
  }
  return windows;
};
