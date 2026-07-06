import * as THREE from 'three';
import { updateFireCrew, type FireCrewRig } from './cityFireCrew3d';
import { tileToPosition } from './cityGrid3d';
import { getResponseVehicleRoutes } from './cityResponseVehicleRoutes';
import { getStopProgressBeforeLight, isRedLightForSegment } from './cityTrafficLights3d';
import { createVehicleMesh, getVehicleClearance, getVehicleSpeed, type VehicleKind } from './cityVehicleConfig3d';
import { firePatrolRoutes, policeRoutes, roadLaneOffset, trafficColors, trafficPlans, trafficRoutes } from './cityVehicleRoutes';
import type { CityStats } from './gameTypes';

export type MovingCar = {
  kind: VehicleKind;
  mesh: THREE.Group;
  path: THREE.Vector3[];
  speed: number;
  routeProgress: number;
  lastTime?: number;
  laneOffset: number;
  stopAtEnd: boolean;
  deployedAt?: number;
  faceTarget?: THREE.Vector3;
  wheels: THREE.Object3D[];
  crew?: FireCrewRig;
};

export const addCarsToScene = (scene: THREE.Scene, stats: CityStats) => {
  const cars: MovingCar[] = [];
  const responseRoutes = getResponseVehicleRoutes(stats.activeIncident, stats.incidentResponses);
  responseRoutes.forEach((responseRoute, index) => {
    cars.push(addCar(
      scene,
      responseRoute.kind,
      route(responseRoute.points),
      responseRoute.elapsedSeconds + index * 1.4,
      true,
      0x4f79b8,
      0,
      tileToPosition(responseRoute.lookAt[0], responseRoute.lookAt[1], 0.45),
    ));
  });
  const policeOnCall = responseRoutes.filter((item) => item.kind === 'police').length;
  const fireOnCall = responseRoutes.filter((item) => item.kind === 'fire').length;
  const ambulanceOnCall = responseRoutes.filter((item) => item.kind === 'ambulance').length;
  if (stats.buildings.hospitals > ambulanceOnCall) {
    cars.push(addCar(scene, 'ambulance', route([[42, 4], [72, 4], [72, 24], [42, 24]]), 6, false));
  }
  addServiceCars(scene, cars, 'police', stats.buildings.police - policeOnCall, policeRoutes, 0, false);
  if (stats.buildings.fireStations > fireOnCall) cars.push(addCar(scene, 'fire', getFirePatrolRoute(), 4, false));
  addServiceCars(scene, cars, 'fire', Math.max(0, stats.buildings.fireStations - fireOnCall - 1), firePatrolRoutes, 18, false);
  addTrafficCars(scene, cars, stats);
  return cars;
};

export const updateCars = (cars: MovingCar[], time: number) => {
  let extinguishing = false;
  const positions = cars.map((car) => car.mesh.position.clone());
  cars.forEach((car, index) => {
    extinguishing = moveCar(car, time, positions, index) || extinguishing;
    positions[index] = car.mesh.position.clone();
  });
  return extinguishing;
};

const getFirePatrolRoute = () => route([[22, 34], [72, 34], [72, 64], [22, 64]]);

const addTrafficCars = (scene: THREE.Scene, cars: MovingCar[], stats: CityStats) => {
  trafficPlans.forEach((plan) => {
    cars.push(addCar(scene, plan.kind, route(trafficRoutes[plan.routeIndex]), plan.offset, false, plan.color, plan.laneOffset));
  });
  const extraTraffic = Math.min(28, stats.buildings.homes + stats.buildings.malls * 3);
  for (let index = 0; index < extraTraffic; index += 1) {
    const plan = createExtraTrafficPlan(index);
    cars.push(addCar(scene, plan.kind, route(trafficRoutes[plan.routeIndex]), plan.offset, false, plan.color, plan.laneOffset));
  }
};

const extraTrafficKinds: Array<'civilian' | 'pickup' | 'van' | 'compact'> = ['civilian', 'compact', 'pickup', 'van'];

const createExtraTrafficPlan = (index: number) => ({
  kind: extraTrafficKinds[index % extraTrafficKinds.length],
  routeIndex: index % trafficRoutes.length,
  color: trafficColors[index % trafficColors.length],
  offset: 130 + index * 7,
  laneOffset: index % 2 === 0 ? -roadLaneOffset : roadLaneOffset,
});

const addServiceCars = (
  scene: THREE.Scene,
  cars: MovingCar[],
  kind: MovingCar['kind'],
  count: number,
  routes: [number, number][][],
  baseOffset: number,
  stopAtEnd: boolean,
) => {
  const visibleCount = Math.min(count, routes.length);
  for (let index = 0; index < visibleCount; index += 1) {
    cars.push(addCar(scene, kind, route(routes[index]), baseOffset + index * 5, stopAtEnd));
  }
};

const route = (points: [number, number][]) => points.map(([x, y]) => tileToPosition(x, y, 0.45));

const addCar = (
  scene: THREE.Scene,
  kind: MovingCar['kind'],
  path: THREE.Vector3[],
  offset: number,
  stopAtEnd: boolean,
  color = 0x4f79b8,
  laneOffset = -roadLaneOffset,
  faceTarget?: THREE.Vector3,
  syncToWorldTime = !stopAtEnd,
) => {
  const mesh = createVehicleMesh(kind, color);
  const speed = getVehicleSpeed(kind);
  const worldOffset = syncToWorldTime ? performance.now() / 1000 : 0;
  scene.add(mesh);
  return {
    kind,
    mesh,
    path,
    speed,
    routeProgress: (offset + worldOffset) * speed,
    laneOffset,
    stopAtEnd,
    faceTarget,
    wheels: mesh.children.filter((item) => item.name === 'wheel'),
    crew: kind === 'fire' ? mesh.userData.crew : undefined,
  };
};

const moveCar = (car: MovingCar, time: number, occupied: THREE.Vector3[], carIndex: number) => {
  const delta = car.lastTime === undefined ? 0 : Math.max(0, time - car.lastTime) * car.speed;
  car.lastTime = time;
  const plannedTotal = car.routeProgress + delta;
  const planned = getRouteState(car, plannedTotal);
  const direction = getCarDirection(car, planned.reachedTarget, planned.segment, planned.next);
  const stopProgress = getStopProgressBeforeLight(car.path[planned.segment], car.path[planned.next]);
  const redLightStop = !planned.reachedTarget
    && stopProgress !== null
    && planned.progress > stopProgress
    && isRedLightForSegment(car.path[planned.segment], car.path[planned.next], time);
  const lane = new THREE.Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(car.laneOffset);
  const plannedProgress = redLightStop ? stopProgress : planned.progress;
  const nextPosition = car.path[planned.segment].clone().lerp(car.path[planned.next], plannedProgress).add(lane);
  const trafficStop = !planned.reachedTarget && isPositionBlocked(nextPosition, car.mesh.position, direction, occupied, carIndex, getVehicleClearance(car.kind));
  const shouldStop = redLightStop || trafficStop;

  if (redLightStop) car.routeProgress = planned.segment + plannedProgress;
  if (!shouldStop) car.routeProgress = plannedTotal;

  const render = trafficStop ? getRouteState(car, car.routeProgress) : { ...planned, progress: plannedProgress };
  const renderDirection = getCarDirection(car, render.reachedTarget, render.segment, render.next);
  const renderLane = new THREE.Vector3(-renderDirection.z, 0, renderDirection.x).normalize().multiplyScalar(car.laneOffset);
  car.mesh.position.lerpVectors(car.path[render.segment], car.path[render.next], render.progress).add(renderLane);
  car.mesh.rotation.y = Math.atan2(renderDirection.z, -renderDirection.x) + (car.kind === 'ambulance' ? Math.PI : 0);
  animateWheels(car, time, render.reachedTarget || shouldStop);
  if (render.reachedTarget && car.deployedAt === undefined) car.deployedAt = time;
  const deployProgress = car.deployedAt === undefined ? 0 : Math.min(1, (time - car.deployedAt) * 0.7);
  updateFireCrew(car.crew, deployProgress, time);
  return render.reachedTarget && car.kind === 'fire' && deployProgress >= 1;
};

const getRouteState = (car: MovingCar, total: number) => {
  const reachedTarget = car.stopAtEnd && total >= car.path.length - 1;
  const segment = reachedTarget ? car.path.length - 2 : Math.floor(total) % car.path.length;
  const next = reachedTarget ? car.path.length - 1 : (segment + 1) % car.path.length;
  const progress = reachedTarget ? 1 : total % 1;
  return { reachedTarget, segment, next, progress };
};

const getCarDirection = (car: MovingCar, reachedTarget: boolean, segment: number, next: number) => {
  if (reachedTarget && car.faceTarget) {
    const toTarget = car.faceTarget.clone().sub(car.path[next]);
    if (toTarget.lengthSq() > 0.001) return toTarget;
  }
  return car.path[next].clone().sub(car.path[segment]);
};

const animateWheels = (car: MovingCar, time: number, stopped: boolean) => {
  car.wheels.forEach((wheel, index) => {
    const baseY = typeof wheel.userData.baseY === 'number' ? wheel.userData.baseY : wheel.position.y;
    const suspension = stopped ? 0 : Math.sin(time * 7 + index * 1.8 + car.routeProgress) * 0.018;
    wheel.position.y = THREE.MathUtils.lerp(wheel.position.y, baseY + suspension, 0.18);
    if (!stopped) wheel.rotation.z -= car.speed * 4.5;
  });
};

const isPositionBlocked = (
  position: THREE.Vector3,
  currentPosition: THREE.Vector3,
  direction: THREE.Vector3,
  occupied: THREE.Vector3[],
  carIndex: number,
  clearance: number,
) => {
  const forward = direction.clone().normalize();
  const side = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
  return occupied.some((other, index) => {
    if (index === carIndex) return false;
    const distance = other.distanceTo(position);
    if (distance >= clearance) return false;
    const toOther = other.clone().sub(currentPosition);
    const ahead = toOther.dot(forward);
    const lateral = Math.abs(toOther.dot(side));
    const sameLane = lateral < 0.82;
    const crossing = distance < clearance * 0.78;
    return ahead > -0.25 && (sameLane || crossing);
  });
};
