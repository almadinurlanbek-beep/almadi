import * as THREE from 'three';
import { getConstructionTile } from './cityMap';
import { tileToPosition } from './cityGrid3d';
import type { ConstructionJob } from './gameTypes';

export const addConstructionSites = (scene: THREE.Scene, jobs: ConstructionJob[]) => {
  jobs.forEach((job, index) => {
    const site = createConstructionSite(job);
    const { x, y } = getConstructionTile(job.buildingId, index);
    site.position.copy(tileToPosition(x, y, 0.12));
    scene.add(site);
  });
};

const createConstructionSite = (job: ConstructionJob) => {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.16, 1.55),
    new THREE.MeshLambertMaterial({ color: 0xa89069 }),
  );
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(getWidth(job), 0.9, getDepth(job)),
    new THREE.MeshBasicMaterial({ color: 0xf0c85a, wireframe: true }),
  );
  const roof = createRoofFrame(job);
  const crane = createCrane();
  base.position.y = 0.08;
  frame.position.y = 0.62;
  roof.position.y = 1.12;
  crane.position.set(-0.72, 0.7, 0.64);
  group.add(base, frame, roof, crane);
  return group;
};

const createRoofFrame = (job: ConstructionJob) => {
  if (job.buildingId !== 'homes') return new THREE.Group();
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.72, 0.35, 4),
    new THREE.MeshBasicMaterial({ color: 0xd66b42, wireframe: true }),
  );
  roof.rotation.y = Math.PI / 4;
  return roof;
};

const createCrane = () => {
  const crane = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 1.15, 0.08),
    new THREE.MeshLambertMaterial({ color: 0xd7a43d }),
  );
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.06, 0.06),
    new THREE.MeshLambertMaterial({ color: 0xd7a43d }),
  );
  pole.position.y = 0.55;
  arm.position.set(0.38, 1.12, 0);
  crane.add(pole, arm);
  return crane;
};

const getWidth = (job: ConstructionJob) => (job.buildingId === 'malls' || job.buildingId === 'factories' ? 1.45 : 1.05);
const getDepth = (job: ConstructionJob) => (job.buildingId === 'malls' || job.buildingId === 'factories' ? 1.35 : 1);
