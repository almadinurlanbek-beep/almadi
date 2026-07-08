import * as THREE from 'three';
import { tileToPosition } from './cityGrid3d';

const cityHallScale = 1.78;

export const addCityHall = (scene: THREE.Scene) => {
  const hall = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 2.8, 3.8),
    new THREE.MeshLambertMaterial({ color: 0xe2d2ad }),
  );
  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.15, 3.2),
    new THREE.MeshLambertMaterial({ color: 0xd3bc8d }),
  );
  const rightWing = leftWing.clone();
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(6.05, 0.42, 4.2),
    new THREE.MeshLambertMaterial({ color: 0x6b4f4a }),
  );
  const pediment = new THREE.Mesh(
    new THREE.ConeGeometry(1.72, 1.15, 3),
    new THREE.MeshLambertMaterial({ color: 0xf0e1bd }),
  );
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 4.7, 1.45),
    new THREE.MeshLambertMaterial({ color: 0xcdb47d }),
  );
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.98, 20, 10),
    new THREE.MeshLambertMaterial({ color: 0x4f8f84 }),
  );
  const stairs = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.32, 1.35),
    new THREE.MeshLambertMaterial({ color: 0xb8aa91 }),
  );
  base.position.y = 1.4;
  leftWing.position.set(-3.75, 1.08, 0.25);
  rightWing.position.set(3.75, 1.08, 0.25);
  roof.position.y = 2.98;
  pediment.position.set(0, 3.48, -2.04);
  pediment.rotation.y = Math.PI / 2;
  tower.position.y = 4.0;
  dome.position.y = 6.75;
  stairs.position.set(0, 0.2, -2.34);
  hall.add(createGrounds(), base, leftWing, rightWing, roof, pediment, tower, dome, stairs, createColumns(), createWindows(), createClock(), createFlag(), createFence(), createOfficialCars());
  hall.scale.setScalar(cityHallScale);
  hall.position.copy(tileToPosition(47, 39, 0.08));
  scene.add(hall);
};

const createGrounds = () => {
  const group = new THREE.Group();
  const courtyard = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.06, 8.8), new THREE.MeshLambertMaterial({ color: 0xcac1a7 }));
  const path = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 4.7), new THREE.MeshLambertMaterial({ color: 0xb5ad96 }));
  const fountain = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.84, 0.18, 20), new THREE.MeshLambertMaterial({ color: 0x8aa5a8 }));
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.04, 20), new THREE.MeshLambertMaterial({ color: 0x4ea8b5 }));
  const lawnA = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.07, 1.7), new THREE.MeshLambertMaterial({ color: 0x6fa45f }));
  const lawnB = lawnA.clone();
  path.position.set(0, 0.06, -3.55);
  fountain.position.set(0, 0.18, -3.2);
  water.position.set(0, 0.3, -3.2);
  lawnA.position.set(-3.45, 0.08, -3.25);
  lawnB.position.set(3.45, 0.08, -3.25);
  group.add(courtyard, path, fountain, water, lawnA, lawnB);
  return group;
};

const createColumns = () => {
  const columns = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ color: 0xf0e6cf });
  for (let index = 0; index < 7; index += 1) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 2.05, 14), material);
    column.position.set(-2.25 + index * 0.75, 1.18, -2.05);
    columns.add(column);
  }
  return columns;
};

const createWindows = () => {
  const group = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ color: 0x9ec7d6 });
  const frame = new THREE.MeshLambertMaterial({ color: 0xf0e6cf });
  const xs = [-4.2, -3.35, -2.1, -1.05, 1.05, 2.1, 3.35, 4.2];
  xs.forEach((x, index) => {
    const window = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.05), material);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.64, 0.035), frame);
    const y = index === 0 || index === xs.length - 1 ? 1.38 : 1.72;
    window.position.set(x, y, -1.94);
    trim.position.set(x, y, -1.97);
    group.add(trim, window);
  });
  return group;
};

const createClock = () => {
  const group = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 24), new THREE.MeshLambertMaterial({ color: 0xf7f1dc }));
  const handA = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.035), new THREE.MeshLambertMaterial({ color: 0x2f3432 }));
  const handB = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.035), new THREE.MeshLambertMaterial({ color: 0x2f3432 }));
  face.rotation.x = Math.PI / 2;
  face.position.set(0, 4.78, -0.76);
  handA.position.set(0, 4.83, -0.8);
  handB.position.set(0.08, 4.78, -0.8);
  group.add(face, handA, handB);
  return group;
};

const createFlag = () => {
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 8), new THREE.MeshLambertMaterial({ color: 0x4b4b4b }));
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.04), new THREE.MeshBasicMaterial({ color: 0x2f7d68 }));
  pole.position.y = 7.55;
  cloth.position.set(0.28, 7.85, 0);
  flag.add(pole, cloth);
  return flag;
};

const createFence = () => {
  const group = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ color: 0x3a3f3c });
  for (let index = 0; index < 9; index += 1) {
    if (index === 4) continue;
    group.add(createFencePost(-4 + index, -3.6, material));
    group.add(createFencePost(-4 + index, 3.6, material));
  }
  for (let index = 0; index < 7; index += 1) {
    group.add(createFencePost(-4.4, -3 + index, material));
    group.add(createFencePost(4.4, -3 + index, material));
  }
  group.add(createRail(0, 0.42, -3.6, 3.2, 0.06, material), createRail(0, 0.68, -3.6, 3.2, 0.06, material));
  group.add(createGate());
  return group;
};

const createFencePost = (x: number, z: number, material: THREE.Material) => {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), material);
  post.position.set(x, 0.42, z);
  return post;
};

const createRail = (x: number, y: number, z: number, width: number, depth: number, material: THREE.Material) => {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, depth), material);
  rail.position.set(x, y, z);
  return rail;
};

const createGate = () => {
  const gate = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ color: 0x2c312f });
  gate.add(createRail(-0.72, 0.48, -3.62, 1.1, 0.06, material), createRail(0.72, 0.48, -3.62, 1.1, 0.06, material));
  gate.add(createRail(-0.72, 0.72, -3.62, 1.1, 0.06, material), createRail(0.72, 0.72, -3.62, 1.1, 0.06, material));
  return gate;
};

const createOfficialCars = () => {
  const group = new THREE.Group();
  const spots = [
    [-3.05, -2.75, 0],
    [3.05, -2.75, Math.PI],
    [-3.1, 2.45, 0],
    [3.1, 2.45, Math.PI],
  ] as const;
  spots.forEach(([x, z, rotation], index) => {
    const car = createCadillacLikeCar(index % 2 ? 0x111416 : 0x26303a);
    car.position.set(x, 0.1, z);
    car.rotation.y = rotation;
    group.add(car);
  });
  return group;
};

const createCadillacLikeCar = (color: number) => {
  const car = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.28, 0.58), new THREE.MeshLambertMaterial({ color }));
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.52), new THREE.MeshLambertMaterial({ color }));
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.26, 0.46), new THREE.MeshLambertMaterial({ color: 0xaed1db }));
  const chrome = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.05, 0.04), new THREE.MeshLambertMaterial({ color: 0xd8dde0 }));
  body.position.y = 0.24;
  hood.position.set(-0.56, 0.36, 0);
  cabin.position.set(0.08, 0.51, 0);
  chrome.position.set(-0.02, 0.4, -0.32);
  car.add(body, hood, cabin, chrome, ...createCarWheels());
  return car;
};

const createCarWheels = () => {
  const material = new THREE.MeshLambertMaterial({ color: 0x111111 });
  return [-0.54, 0.54].flatMap((x) => [-0.34, 0.34].map((z) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), material);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.08, z);
    return wheel;
  }));
};
