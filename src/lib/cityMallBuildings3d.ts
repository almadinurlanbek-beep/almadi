import * as THREE from 'three';

const glass = new THREE.MeshLambertMaterial({ color: 0x9fd4e4, emissive: 0x2e6574, emissiveIntensity: 0.22 });
const asphalt = new THREE.MeshLambertMaterial({ color: 0x3f4648 });
const white = new THREE.MeshLambertMaterial({ color: 0xf4f1e8 });

export const createMallBuilding = (variant: number) => {
  if (variant === 0) return createTashkentCityMall();
  if (variant === 1) return createMegaAlmaAtaMall();
  return createInfinityAtyrauMall();
};

const createTashkentCityMall = () => {
  const group = new THREE.Group();
  const towerMat = new THREE.MeshLambertMaterial({ color: 0xbfd0d5 });
  group.add(box(4.2, 1.15, 3.4, white, 0, 0.58, 0));
  group.add(box(2.25, 10, 2.15, towerMat, 0, 5.62, 0));
  group.add(box(2.85, 0.2, 2.7, new THREE.MeshLambertMaterial({ color: 0x3f535a }), 0, 10.72, 0));
  group.add(createHelipad(10.86), sign('TASHKENT CITY', 2.8, 0.46, 0, 1.25, -1.74));
  group.add(...createWindowGrid(3, 11, 0.62, 0.78, -1.1), ...createUzbekPattern());
  return group;
};

const createMegaAlmaAtaMall = () => {
  const group = new THREE.Group();
  const wall = new THREE.MeshLambertMaterial({ color: 0xe3d6c5 });
  group.add(box(8.8, 3, 6.6, wall, 0, 1.5, 0));
  group.add(box(9.1, 0.24, 6.9, new THREE.MeshLambertMaterial({ color: 0x59666b }), 0, 3.12, 0));
  group.add(box(5.7, 0.2, 0.85, new THREE.MeshLambertMaterial({ color: 0xd1433f }), 0, 2.45, -3.62));
  group.add(box(1.45, 1.2, 0.06, glass, 0, 0.65, -3.34), sign('MEGA ALMA-ATA', 3.25, 0.52, 0, 1.85, -3.68));
  group.add(...[-3.2, -1.6, 1.6, 3.2].map((x) => box(1.0, 0.58, 0.06, glass, x, 1.38, -3.34)));
  group.add(createParking(7.4, 2.7, 4.6));
  return group;
};

const createInfinityAtyrauMall = () => {
  const group = new THREE.Group();
  const wall = new THREE.MeshLambertMaterial({ color: 0xd9ddd7 });
  const green = new THREE.MeshLambertMaterial({ color: 0x5f9a72 });
  group.add(box(7.7, 2.9, 6.2, wall, 0, 1.45, 0));
  group.add(box(8.0, 0.2, 6.5, new THREE.MeshLambertMaterial({ color: 0x53615b }), 0, 3.03, 0));
  group.add(box(1.2, 3.3, 0.08, green, -3.2, 1.68, -3.14), box(1.2, 3.3, 0.08, green, 3.2, 1.68, -3.14));
  group.add(box(1.25, 1.05, 0.06, glass, 0, 0.58, -3.12), sign('INFINITY ATYRAU', 3.15, 0.5, 0, 1.78, -3.47));
  group.add(...[-2.1, -0.7, 0.7, 2.1].map((x) => box(0.82, 0.6, 0.06, glass, x, 1.42, -3.12)));
  group.add(createInfinitySculpture(), createParking(6.8, 2.2, 4.45));
  return group;
};

const createHelipad = (y: number) => {
  const pad = new THREE.Group();
  pad.add(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.05, 32), new THREE.MeshLambertMaterial({ color: 0x283235 })));
  pad.add(box(0.72, 0.055, 0.12, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, 0.04, 0));
  pad.add(box(0.12, 0.055, 0.72, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, 0.045, 0));
  pad.position.y = y;
  return pad;
};

const createWindowGrid = (columns: number, floors: number, gapX: number, gapY: number, z: number) => {
  const windows: THREE.Mesh[] = [];
  for (let floor = 0; floor < floors; floor += 1) {
    for (let col = 0; col < columns; col += 1) {
      const x = (col - 1) * gapX;
      windows.push(box(0.34, 0.28, 0.04, glass, x, 1.35 + floor * gapY, z));
      windows.push(box(0.34, 0.28, 0.04, glass, x, 1.35 + floor * gapY, -z));
    }
  }
  return windows;
};

const createUzbekPattern = () => [-1.55, -0.52, 0.52, 1.55].map((x, index) => {
  const tile = box(0.32, 0.32, 0.05, new THREE.MeshLambertMaterial({ color: index % 2 ? 0x2b9a9d : 0xf0c75e }), x, 0.72, -1.74);
  tile.rotation.z = Math.PI / 4;
  return tile;
});

const createInfinitySculpture = () => {
  const shape = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.045, 8, 32), new THREE.MeshLambertMaterial({ color: 0x4a8f6a }));
  shape.scale.x = 1.6;
  shape.rotation.y = Math.PI / 2;
  shape.position.set(-2.95, 0.82, -3.48);
  return shape;
};

const createParking = (width: number, depth: number, z: number) => {
  const group = new THREE.Group();
  group.add(box(width, 0.04, depth, asphalt, 0, 0.04, z));
  [-2.4, -0.8, 0.8, 2.4].forEach((x) => {
    group.add(box(0.08, 0.025, depth * 0.7, new THREE.MeshBasicMaterial({ color: 0xffffff }), x, 0.08, z));
    group.add(createParkedCar(x - 0.42, z, x > 0 ? 0x2f6f9f : 0x3c4448));
  });
  return group;
};

const createParkedCar = (x: number, z: number, color: number) => {
  const car = new THREE.Group();
  car.add(box(0.95, 0.18, 0.42, new THREE.MeshLambertMaterial({ color }), 0, 0.18, 0));
  car.add(box(0.42, 0.18, 0.34, glass, -0.05, 0.34, 0));
  car.position.set(x, 0.08, z);
  return car;
};

const sign = (text: string, width: number, height: number, x: number, y: number, z: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#fffaf0';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#24313a';
    context.font = '700 44px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 256, 66);
  }
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.04), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) }));
  mesh.position.set(x, y, z);
  return mesh;
};

const box = (width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
};
