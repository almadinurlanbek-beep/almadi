import * as THREE from 'three';
import { cellSize, cityCenter } from './cityGrid3d';

type Aircraft = {
  mesh: THREE.Group;
  direction: THREE.Vector3;
  speed: number;
};

export type AirportTraffic = {
  active: boolean;
  aircraft: Aircraft[];
  nextSpawnAt: number;
  startAt: number;
};

const cityLimit = cityCenter * cellSize + 24;
const spawnEverySeconds = 6;

export const createAirportTraffic = (airportCount: number, time: number): AirportTraffic => ({
  active: airportCount > 0,
  aircraft: [],
  nextSpawnAt: time + 30,
  startAt: time + 30,
});

export const updateAirportTraffic = (scene: THREE.Scene, traffic: AirportTraffic, time: number) => {
  if (!traffic.active || time < traffic.startAt) return;
  if (time >= traffic.nextSpawnAt) {
    traffic.aircraft.push(spawnPlane(scene, time));
    traffic.nextSpawnAt = time + spawnEverySeconds;
  }
  traffic.aircraft = traffic.aircraft.filter((aircraft) => {
    aircraft.mesh.position.addScaledVector(aircraft.direction, aircraft.speed);
    aircraft.mesh.position.y += Math.sin(time * 1.8 + aircraft.speed * 10) * 0.01;
    if (isOutsideCity(aircraft.mesh.position)) {
      scene.remove(aircraft.mesh);
      return false;
    }
    return true;
  });
};

const spawnPlane = (scene: THREE.Scene, time: number) => {
  const angle = getSpawnAngle(time);
  const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
  const side = getSpawnSide(time);
  const start = direction.clone().multiplyScalar(-cityLimit);
  const cross = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(side);
  const mesh = createFlyingPlane();
  mesh.position.copy(start.add(cross));
  mesh.position.y = 18 + (Math.sin(time * 0.7) + 1) * 5;
  mesh.rotation.y = Math.atan2(direction.z, -direction.x);
  scene.add(mesh);
  return { mesh, direction, speed: 0.34 + (Math.sin(time) + 1) * 0.04 };
};

const getSpawnAngle = (time: number) => {
  const options = [0, Math.PI / 4, Math.PI / 2, Math.PI * 0.85, Math.PI * 1.15, Math.PI * 1.5, Math.PI * 1.75];
  return options[Math.floor(time) % options.length];
};

const getSpawnSide = (time: number) => {
  return Math.sin(time * 1.37) * cityLimit * 0.55;
};

const isOutsideCity = (position: THREE.Vector3) => {
  return Math.abs(position.x) > cityLimit || Math.abs(position.z) > cityLimit;
};

const createFlyingPlane = () => {
  const plane = new THREE.Group();
  plane.add(
    box(2.35, 0.24, 0.22, 0xf4f7f8, 0, 0, 0),
    box(0.72, 0.06, 2.05, 0xd8e1e4, -0.15, 0.02, 0),
    box(0.28, 0.52, 0.08, 0xd64242, 0.95, 0.2, 0),
    box(0.5, 0.05, 0.72, 0xd8e1e4, 0.82, 0.12, 0),
    box(0.18, 0.18, 0.18, 0x2f4f6f, -1.24, 0.01, 0),
  );
  return plane;
};

const box = (width: number, height: number, depth: number, color: number, x: number, y: number, z: number) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(x, y, z);
  return mesh;
};
