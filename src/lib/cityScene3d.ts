import * as THREE from 'three';
import { createAirportTraffic, updateAirportTraffic, type AirportTraffic } from './cityAirportTraffic3d';
import type { MapTile } from './cityMap';
import { createBasicBuilding } from './cityBasicBuildings3d';
import { createBridges } from './cityBridges3d';
import { addConstructionSites } from './cityConstruction3d';
import { createFactory } from './cityFactory3d';
import { cellSize, cityCenter, tileToPosition } from './cityGrid3d';
import { addCityHall } from './cityHall3d';
import { addIncidentMarker, updateFireEffect, type FireEffect } from './cityIncidents3d';
import { createCountLabel } from './cityLabels3d';
import { createMallBuilding } from './cityMallBuildings3d';
import { getMallVariantAt } from './cityMallZone';
import { addPedestrians, updatePedestrians, type Pedestrian } from './cityPeople3d';
import { addRailwayToScene, updateRailway, type Railway } from './cityRailway3d';
import { addTrafficLights, updateTrafficLights, type TrafficLightRig } from './cityTrafficLights3d';
import { createAirport, createStation } from './cityTransportBuildings3d';
import { addCarsToScene, updateCars, type MovingCar } from './cityVehicles3d';
import type { CityStats } from './gameTypes';

export type SceneEntity = {
  airportTraffic: AirportTraffic;
  cars: MovingCar[];
  fire: FireEffect | null;
  grass: THREE.Object3D[];
  pedestrians: Pedestrian[];
  railway: Railway;
  trafficLights: TrafficLightRig[];
};

export const buildCityScene = (scene: THREE.Scene, tiles: MapTile[], stats: CityStats): SceneEntity => {
  const entities: SceneEntity = {
    airportTraffic: createAirportTraffic(stats.buildings.airports, performance.now() / 1000),
    cars: [],
    fire: null,
    grass: [],
    pedestrians: [],
    railway: { active: false, trains: [] },
    trafficLights: [],
  };
  scene.add(createGround(tiles));
  scene.add(createBridges());
  addCityHall(scene);
  addConstructionSites(scene, stats.construction);
  entities.trafficLights = addTrafficLights(scene, tiles);
  tiles.forEach((tile) => addTileObject(scene, entities, tile));
  entities.fire = addIncidentMarker(scene, stats.activeIncident);
  entities.pedestrians = addPedestrians(scene, tiles);
  entities.cars = addCarsToScene(scene, stats);
  entities.railway = addRailwayToScene(scene, stats.buildings.stations);
  return entities;
};

const createGround = (tiles: MapTile[]) => {
  const group = new THREE.Group();
  const variants = ['lot', 'road', 'water', 'home', 'service', 'nature', 'work'] as const;
  const colors: Record<(typeof variants)[number], number> = {
    lot: 0xb7ccb0,
    road: 0x555d60,
    water: 0x4ea8b5,
    home: 0xd7c2a7,
    service: 0xcdd6da,
    nature: 0x79ad69,
    work: 0xc8b990,
  };
  variants.forEach((variant) => {
    const matching = tiles.filter((tile) => tile.variant === variant);
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(cellSize, 0.08, cellSize),
      new THREE.MeshLambertMaterial({ color: colors[variant] }),
      matching.length,
    );
    const dummy = new THREE.Object3D();
    matching.forEach((tile, index) => {
      dummy.position.copy(tileToPosition(tile.x, tile.y));
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    group.add(mesh);
  });
  group.add(createRoadLines(tiles));
  return group;
};

const createRoadLines = (tiles: MapTile[]) => {
  const group = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ color: 0xf2c94c });
  const horizontal = tiles.filter((tile) => tile.model === 'road' && tile.y % 10 === 4);
  const vertical = tiles.filter((tile) => tile.model === 'road' && tile.x % 10 === 2);
  group.add(createRoadLineMesh(horizontal, 1.35, 0.08, material));
  group.add(createRoadLineMesh(vertical, 0.08, 1.35, material));
  return group;
};

const createRoadLineMesh = (tiles: MapTile[], width: number, depth: number, material: THREE.Material) => {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(width, 0.018, depth), material, tiles.length);
  const dummy = new THREE.Object3D();
  tiles.forEach((tile, index) => {
    const position = tileToPosition(tile.x, tile.y, 0.08);
    dummy.position.copy(position);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });
  return mesh;
};

const addTileObject = (scene: THREE.Scene, entities: SceneEntity, tile: MapTile) => {
  if (!tile.count && tile.model !== 'park') return;
  if (tile.model === 'lot' || tile.model === 'road' || tile.model === 'water') return;
  const position = tileToPosition(tile.x, tile.y, 0.1);
  const model = tile.model === 'park' ? createGrassPatch(entities) : createBuilding(tile);
  model.position.copy(position);
  scene.add(model);
  if (tile.count) scene.add(createCountLabel('1', position.clone().add(new THREE.Vector3(0, getLabelHeight(tile), 0))));
};

const createBuilding = (tile: MapTile) => {
  const model = tile.model;
  if (model === 'factory') return createFactory();
  if (model === 'mall') return createMallBuilding(getMallVariantAt(tile.x, tile.y));
  if (model === 'airport') return faceCity(createAirport(), tile);
  if (model === 'station') return faceCity(createStation(), tile);
  return createBasicBuilding(model);
};

const faceCity = (model: THREE.Group, tile: MapTile) => {
  const dx = cityCenter - tile.x;
  const dy = cityCenter - tile.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    model.rotation.y = dx > 0 ? -Math.PI / 2 : Math.PI / 2;
  } else {
    model.rotation.y = dy > 0 ? Math.PI : 0;
  }
  return model;
};

const getLabelHeight = (tile: MapTile) => {
  if (tile.model === 'mall' && getMallVariantAt(tile.x, tile.y) === 0) return 11.8;
  if (tile.model === 'mall') return 3.8;
  return 2.8;
};

const createGrassPatch = (entities: SceneEntity) => {
  const group = new THREE.Group();
  for (let index = 0; index < 12; index += 1) {
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.55, 5),
      new THREE.MeshLambertMaterial({ color: index % 2 ? 0x3f8f45 : 0x66ad55 }),
    );
    blade.position.set((index % 4) * 0.34 - 0.52, 0.28, Math.floor(index / 4) * 0.34 - 0.34);
    group.add(blade);
    entities.grass.push(blade);
  }
  return group;
};

export const updateCityScene = (scene: THREE.Scene, entities: SceneEntity, time: number) => {
  entities.grass.forEach((blade, index) => {
    blade.rotation.z = Math.sin(time * 3 + index) * 0.18;
  });
  updateAirportTraffic(scene, entities.airportTraffic, time);
  updateRailway(entities.railway, time);
  updatePedestrians(entities.pedestrians, time);
  updateTrafficLights(entities.trafficLights, time);
  const extinguishing = updateCars(entities.cars, time);
  updateFireEffect(entities.fire, time, extinguishing);
};
