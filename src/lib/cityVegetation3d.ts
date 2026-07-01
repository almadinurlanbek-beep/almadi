import * as THREE from 'three';
import type { MapTile } from './cityMap';
import { tileToPosition } from './cityGrid3d';

const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x6f4a2f });
const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x3f8f45 });
const darkLeafMaterial = new THREE.MeshLambertMaterial({ color: 0x2f6f38 });
const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x5da85a });

export const createVegetation = (tiles: MapTile[]) => {
  const group = new THREE.Group();
  const treeTiles = tiles.filter((tile) => isEmptyLot(tile) && shouldPlaceTree(tile));
  const bushTiles = tiles.filter((tile) => isEmptyLot(tile) && shouldPlaceBush(tile));
  group.add(createTreeTrunks(treeTiles));
  group.add(createTreeCrowns(treeTiles));
  group.add(createBushes(bushTiles));
  return group;
};

const isEmptyLot = (tile: MapTile) => tile.model === 'lot' && tile.variant === 'lot' && !tile.buildingId;

const shouldPlaceTree = (tile: MapTile) => {
  return (tile.x * 17 + tile.y * 23) % 19 === 0;
};

const shouldPlaceBush = (tile: MapTile) => {
  return (tile.x * 11 + tile.y * 7) % 13 === 0;
};

const createTreeTrunks = (tiles: MapTile[]) => {
  const mesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.1, 0.55, 6), trunkMaterial, tiles.length);
  const dummy = new THREE.Object3D();
  tiles.forEach((tile, index) => {
    const position = getVegetationPosition(tile, index);
    dummy.position.set(position.x, 0.38, position.z);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });
  return mesh;
};

const createTreeCrowns = (tiles: MapTile[]) => {
  const mesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.34, 0.82, 7), leafMaterial, tiles.length);
  const dummy = new THREE.Object3D();
  tiles.forEach((tile, index) => {
    const position = getVegetationPosition(tile, index);
    dummy.position.set(position.x, 1.05, position.z);
    dummy.rotation.y = ((tile.x + tile.y) % 8) * 0.4;
    dummy.scale.setScalar(0.88 + ((tile.x * tile.y) % 5) * 0.07);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });
  return mesh;
};

const createBushes = (tiles: MapTile[]) => {
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.22, 1), bushMaterial, tiles.length);
  const dummy = new THREE.Object3D();
  tiles.forEach((tile, index) => {
    const position = getVegetationPosition(tile, index + 4);
    dummy.position.set(position.x, 0.25, position.z);
    dummy.scale.set(1.15, 0.62, 0.9);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });
  return mesh;
};

const getVegetationPosition = (tile: MapTile, index: number) => {
  const base = tileToPosition(tile.x, tile.y, 0);
  const xOffset = (((tile.x * 31 + index * 13) % 100) / 100 - 0.5) * 1.05;
  const zOffset = (((tile.y * 29 + index * 17) % 100) / 100 - 0.5) * 1.05;
  return { x: base.x + xOffset, z: base.z + zOffset };
};

export const createParkTree = () => {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.62, 6), trunkMaterial);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.9, 7), darkLeafMaterial);
  trunk.position.y = 0.38;
  crown.position.y = 1.08;
  group.add(trunk, crown);
  return group;
};
