import * as THREE from 'three';
import type { FireEffect } from './cityIncidents3d';

export const addProtestCrowd = (group: THREE.Group, effect: FireEffect) => {
  const count = 31 + Math.floor(Math.random() * 20);
  for (let index = 0; index < count; index += 1) {
    const angle = index * 2.4;
    const radius = 0.45 + (index % 7) * 0.18 + Math.random() * 0.18;
    const person = createProtester(index);
    person.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    person.rotation.y = -angle + Math.sin(index) * 0.4;
    group.add(person);
    effect.movers.push(person);
  }
};

const createProtester = (index: number) => {
  const group = new THREE.Group();
  const shirtColors = [0x4f79b8, 0xc75a4a, 0x5a9b72, 0xd0a94a, 0x8f6bb3];
  const skin = new THREE.MeshLambertMaterial({ color: [0xe1b28a, 0xc98f65, 0xf0c7a0][index % 3] });
  const shirt = new THREE.MeshLambertMaterial({ color: shirtColors[index % shirtColors.length] });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.22, 4, 8), shirt);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), skin);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.06), new THREE.MeshLambertMaterial({ color: 0x27384c }));
  body.position.y = 0.32;
  head.position.y = 0.54;
  legs.position.y = 0.13;
  group.add(body, head, legs);
  if (index % 2 === 0) group.add(createProtestSign(index));
  return group;
};

const createProtestSign = (index: number) => {
  const group = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.58, 6), new THREE.MeshLambertMaterial({ color: 0x6d4b2c }));
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.22, 0.03),
    new THREE.MeshBasicMaterial({ map: createSignTexture() }),
  );
  stick.position.set(index % 4 < 2 ? -0.1 : 0.1, 0.58, 0);
  sign.position.set(stick.position.x, 0.86, 0);
  group.add(stick, sign);
  return group;
};

const createSignTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#f2d36b';
    context.fillRect(0, 0, 128, 64);
    context.strokeStyle = '#6d4b2c';
    context.lineWidth = 5;
    context.strokeRect(4, 4, 120, 56);
    context.fillStyle = '#7a1f1f';
    context.font = '800 22px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('ПРОТЕСТ', 64, 34);
  }
  return new THREE.CanvasTexture(canvas);
};
