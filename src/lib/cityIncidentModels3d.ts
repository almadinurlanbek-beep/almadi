import * as THREE from 'three';
import { addChaseModel } from './cityChaseModel3d';
import { addProtestCrowd } from './cityProtestModel3d';
import { addTerrorModel } from './cityTerrorModel3d';
import type { FireEffect } from './cityIncidents3d';
import type { CityStats, Incident } from './gameTypes';

const incidentIcons: Record<Incident['kind'], string> = {
  fire: '!',
  flood: '~',
  crime: '?',
  chase: '!',
  epidemic: '+',
  robots: '⚙',
  protest: '!',
  terror: '!',
};

export const addIncidentModel = (group: THREE.Group, effect: FireEffect, kind: Incident['kind'], responses: CityStats['incidentResponses']) => {
  if (kind === 'fire') addFireModel(group, effect);
  if (kind === 'flood') addFloodModel(group, effect);
  if (kind === 'crime') addCrimeModel(group, effect);
  if (kind === 'chase') addChaseModel(group, effect, getPoliceResponderCount(responses));
  if (kind === 'epidemic') addEpidemicModel(group, effect);
  if (kind === 'robots') addRobotModel(group, effect);
  if (kind === 'protest') addProtestModel(group, effect);
  if (kind === 'terror') addTerrorModel(group, effect);
};

const getPoliceResponderCount = (responses: CityStats['incidentResponses']) => {
  return responses
    .filter((response) => response.method === 'police')
    .reduce((total, response) => total + response.people, 0);
};

export const createIncidentLabel = (kind: Incident['kind']) => {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = kind === 'flood' ? '#2f94a4' : kind === 'epidemic' ? '#4c9f45' : '#c9362d';
    context.beginPath();
    context.arc(48, 48, 30, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#fff8e8';
    context.font = '800 38px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(incidentIcons[kind], 48, 50);
  }
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
  sprite.scale.set(1.45, 1.45, 1.45);
  return sprite;
};

const addFireModel = (group: THREE.Group, effect: FireEffect) => {
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.78, 16, 10), new THREE.MeshBasicMaterial({ color: 0xff7a2d, transparent: true, opacity: 0.18 }));
  glow.position.y = 0.62;
  group.add(glow);
  effect.movers.push(glow);
  for (let index = 0; index < 8; index += 1) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.16 + (index % 3) * 0.04, 0.75 + (index % 2) * 0.25, 8), new THREE.MeshBasicMaterial({ color: index % 2 ? 0xffd45c : 0xe6452f }));
    flame.position.set(Math.cos(index) * 0.34, 0.48, Math.sin(index) * 0.28);
    group.add(flame);
    effect.flames.push(flame);
  }
  for (let index = 0; index < 5; index += 1) {
    const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.2 + index * 0.025, 10, 8), new THREE.MeshBasicMaterial({ color: 0x65706c, transparent: true, opacity: 0.36 }));
    smoke.position.set((index - 2) * 0.16, 1.04 + index * 0.16, Math.sin(index) * 0.12);
    group.add(smoke);
    effect.smoke.push(smoke);
  }
};

const addFloodModel = (group: THREE.Group, effect: FireEffect) => {
  for (let index = 0; index < 4; index += 1) {
    const wave = new THREE.Mesh(new THREE.TorusGeometry(0.34 + index * 0.12, 0.025, 8, 32), new THREE.MeshBasicMaterial({ color: 0x44b6c7 }));
    wave.rotation.x = Math.PI / 2;
    wave.position.y = 0.1 + index * 0.02;
    group.add(wave);
    effect.movers.push(wave);
  }
};

const addCrimeModel = (group: THREE.Group, effect: FireEffect) => {
  const bag = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.34), new THREE.MeshLambertMaterial({ color: 0x2f2922 }));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 6, 16, Math.PI), new THREE.MeshLambertMaterial({ color: 0x17120f }));
  const glow = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.025, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffd34d }));
  body.position.y = 0.22;
  handle.position.y = 0.48;
  handle.rotation.x = Math.PI;
  glow.position.y = 0.05;
  glow.rotation.x = Math.PI / 2;
  bag.add(body, handle, glow);
  group.add(bag);
  effect.movers.push(glow);
};

const addEpidemicModel = (group: THREE.Group, effect: FireEffect) => {
  const virus = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), new THREE.MeshBasicMaterial({ color: 0x6acc5a }));
  virus.position.y = 0.55;
  group.add(virus);
  effect.movers.push(virus);
};

const addRobotModel = (group: THREE.Group, effect: FireEffect) => {
  for (let index = 0; index < 3; index += 1) {
    const bot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), new THREE.MeshLambertMaterial({ color: 0x8c9aa3 }));
    bot.position.set((index - 1) * 0.38, 0.35, Math.sin(index) * 0.16);
    group.add(bot);
    effect.movers.push(bot);
  }
};

const addProtestModel = (group: THREE.Group, effect: FireEffect) => {
  addProtestCrowd(group, effect);
};
