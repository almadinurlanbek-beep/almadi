import * as THREE from 'three';
import { tileToPosition } from './cityGrid3d';

export const addCityHall = (scene: THREE.Scene) => {
  const hall = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.4, 3.2),
    new THREE.MeshLambertMaterial({ color: 0xd8c7a2 }),
  );
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 3.8, 1.2),
    new THREE.MeshLambertMaterial({ color: 0xc6ad7b }),
  );
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 16, 8),
    new THREE.MeshLambertMaterial({ color: 0x5f8a7b }),
  );
  const stairs = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.28, 1.1),
    new THREE.MeshLambertMaterial({ color: 0xb8aa91 }),
  );
  base.position.y = 1.2;
  tower.position.y = 3.1;
  dome.position.y = 5.05;
  stairs.position.set(0, 0.18, -1.95);
  hall.add(createGrounds(), base, tower, dome, stairs, createColumns(), createFlag(), createFence(), createOfficialCars());
  hall.position.copy(tileToPosition(49, 39, 0.08));
  scene.add(hall);
};

const createGrounds = () => {
  const group = new THREE.Group();
  const courtyard = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.06, 7.2), new THREE.MeshLambertMaterial({ color: 0xc7c0aa }));
  const path = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 3.7), new THREE.MeshLambertMaterial({ color: 0xb5ad96 }));
  const lawnA = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.07, 1.4), new THREE.MeshLambertMaterial({ color: 0x6fa45f }));
  const lawnB = lawnA.clone();
  path.position.set(0, 0.06, -3.05);
  lawnA.position.set(-2.8, 0.08, -2.7);
  lawnB.position.set(2.8, 0.08, -2.7);
  group.add(courtyard, path, lawnA, lawnB);
  return group;
};

const createColumns = () => {
  const columns = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ color: 0xf0e6cf });
  for (let index = 0; index < 5; index += 1) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.6, 12), material);
    column.position.set(-1.6 + index * 0.8, 0.95, -1.7);
    columns.add(column);
  }
  return columns;
};

const createFlag = () => {
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 8), new THREE.MeshLambertMaterial({ color: 0x4b4b4b }));
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.04), new THREE.MeshBasicMaterial({ color: 0x2f7d68 }));
  pole.position.y = 5.85;
  cloth.position.set(0.28, 6.15, 0);
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
