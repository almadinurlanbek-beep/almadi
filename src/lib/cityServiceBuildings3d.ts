import * as THREE from 'three';

const brick = new THREE.MeshLambertMaterial({ color: 0xb64a3b });
const concrete = new THREE.MeshLambertMaterial({ color: 0xd9dee2 });
const dark = new THREE.MeshLambertMaterial({ color: 0x252b2f });
const glass = new THREE.MeshLambertMaterial({ color: 0x9bd3df, emissive: 0x376b78, emissiveIntensity: 0.2 });
const policeBlue = new THREE.MeshLambertMaterial({ color: 0x244e91 });
const fireRed = new THREE.MeshLambertMaterial({ color: 0xc9362d });

export const createPoliceStation = () => {
  const group = new THREE.Group();
  group.add(part(1.8, 1.15, 1.35, concrete, 0, 0.58, 0));
  group.add(part(1.96, 0.18, 1.5, policeBlue, 0, 1.22, 0));
  group.add(part(0.42, 0.88, 0.08, dark, 0, 0.46, -0.72));
  group.add(part(0.42, 0.72, 0.1, glass, -0.55, 0.58, -0.72));
  group.add(part(0.42, 0.72, 0.1, glass, 0.55, 0.58, -0.72));
  group.add(part(0.22, 0.2, 0.1, policeBlue, 0, 1.5, -0.74));
  group.add(part(0.7, 0.05, 0.4, dark, -0.48, 0.04, -1.03));
  group.add(part(0.52, 0.16, 0.28, policeBlue, -0.48, 0.16, -1.03));
  group.add(createSign('POLICE', 0x244e91, 1.46));
  group.add(createFlagPole());
  return group;
};

export const createFireStation = () => {
  const group = new THREE.Group();
  group.add(part(2.05, 1.1, 1.42, brick, 0, 0.55, 0));
  group.add(part(2.18, 0.16, 1.55, dark, 0, 1.17, 0));
  group.add(part(0.62, 0.86, 0.1, dark, -0.42, 0.45, -0.77));
  group.add(part(0.62, 0.86, 0.1, dark, 0.42, 0.45, -0.77));
  group.add(part(0.48, 0.72, 0.12, fireRed, -0.42, 0.42, -0.84));
  group.add(part(0.48, 0.72, 0.12, fireRed, 0.42, 0.42, -0.84));
  group.add(part(0.9, 1.78, 0.82, brick, 0.86, 0.89, 0.1));
  group.add(part(0.74, 0.42, 0.86, glass, 0.86, 1.58, 0.1));
  group.add(part(0.18, 0.18, 0.18, fireRed, 0.86, 2.0, 0.1));
  group.add(createSign('FIRE', 0xf7f1dd, 1.38));
  return group;
};

const createFlagPole = () => {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8), dark);
  const flag = part(0.36, 0.2, 0.035, policeBlue, 0.18, 0.84, 0);
  pole.position.y = 0.55;
  group.position.set(0.86, 0.72, -0.66);
  group.add(pole, flag);
  return group;
};

const createSign = (text: string, color: number, y: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#fff7df';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.font = '800 38px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 50);
  }
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.24, 0.34, 0.04),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) }),
  );
  sign.position.set(0, y, -0.79);
  return sign;
};

const part = (width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
};
