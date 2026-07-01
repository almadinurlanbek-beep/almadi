import * as THREE from 'three';
import type { MapTile } from './cityMap';

export type PersonRig = {
  group: THREE.Group;
  body: THREE.Object3D;
  head: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  leftFoot: THREE.Object3D;
  rightFoot: THREE.Object3D;
};

export const createPerson = (model: MapTile['model'], seed: number): PersonRig => {
  const group = new THREE.Group();
  const skin = new THREE.MeshLambertMaterial({ color: [0xe1b28a, 0xc98f65, 0xf0c7a0][seed % 3] });
  const outfit = new THREE.MeshLambertMaterial({ color: getShirtColor(model, seed) });
  const pants = new THREE.MeshLambertMaterial({ color: [0x26384f, 0x6b5b4a, 0x355d52][seed % 3] });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.32, 5, 12), outfit);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 10), skin);
  const leftArm = createLimb(0.035, 0.25, outfit, -0.145, 0.38);
  const rightArm = createLimb(0.035, 0.25, outfit, 0.145, 0.38);
  const leftLeg = createLimb(0.045, 0.25, pants, -0.06, 0.13);
  const rightLeg = createLimb(0.045, 0.25, pants, 0.06, 0.13);
  const leftFoot = createFoot(-0.06);
  const rightFoot = createFoot(0.06);

  body.position.y = 0.36;
  head.position.y = 0.66;
  group.add(body, head, createHair(seed), createFace(), leftArm, rightArm, leftLeg, rightLeg, leftFoot, rightFoot);
  if (seed % 4 === 0) group.add(createBag());
  if (seed % 5 === 0) group.add(createCap());
  return { group, body, head, leftArm, rightArm, leftLeg, rightLeg, leftFoot, rightFoot };
};

const getShirtColor = (model: MapTile['model'], seed: number) => {
  const home = [0xd08b45, 0x5a83c7, 0xc75a6a, 0x579b7a];
  const park = [0x3d8b57, 0x6fa84f, 0xd0a94a, 0x4f9ea8];
  const mall = [0x4d73b9, 0x9b62bd, 0x2f9e91, 0xd46a58];
  const colors = model === 'park' ? park : model === 'mall' ? mall : home;
  return colors[seed % colors.length];
};

const createHair = (seed: number) => {
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.118, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: [0x2b1d18, 0x5c3a22, 0x111111][seed % 3] }),
  );
  hair.position.y = 0.72;
  return hair;
};

const createFace = () => {
  const face = new THREE.Group();
  const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x182026 });
  [-0.035, 0.035].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), eyeMaterial);
    eye.position.set(x, 0.67, -0.105);
    face.add(eye);
  });
  return face;
};

const createCap = () => {
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.16), new THREE.MeshLambertMaterial({ color: 0x2d5b9a }));
  cap.position.set(0, 0.745, -0.02);
  return cap;
};

const createLimb = (radius: number, height: number, material: THREE.Material, x: number, y: number) => {
  const limb = new THREE.Mesh(new THREE.CapsuleGeometry(radius, height, 4, 8), material);
  limb.position.set(x, y, 0);
  return limb;
};

const createFoot = (x: number) => {
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.13), new THREE.MeshLambertMaterial({ color: 0x1e2427 }));
  foot.position.set(x, 0.02, 0.035);
  return foot;
};

const createBag = () => {
  const bag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.06), new THREE.MeshLambertMaterial({ color: 0x6a4632 }));
  bag.position.set(0.16, 0.37, -0.05);
  return bag;
};
