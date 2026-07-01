import * as THREE from 'three';
import { modelByBuilding, variants } from './cityMapConfig';
import { tileToPosition } from './cityGrid3d';
import { createCityBuildingModel } from './cityScene3d';
import { disposeScene } from './threeDispose';
import type { MapTile } from './cityMap';
import type { BuildingId, TilePoint } from './gameTypes';

export type BuildingDragPreview = {
  mesh: THREE.Group;
};

export const createBuildingDragPreview = (buildingId: BuildingId, point: TilePoint) => {
  const model = modelByBuilding[buildingId];
  const tile: MapTile = {
    id: 'drag-preview',
    x: point.x,
    y: point.y,
    label: '',
    count: 1,
    buildingId,
    buildingIndex: 0,
    model,
    variant: variants[model],
  };
  const mesh = createCityBuildingModel(tile);
  makeTransparent(mesh);
  updateBuildingDragPreview({ mesh }, point);
  return { mesh };
};

export const updateBuildingDragPreview = (preview: BuildingDragPreview, point: TilePoint) => {
  preview.mesh.position.copy(tileToPosition(point.x, point.y, 0.16));
};

export const removeBuildingDragPreview = (scene: THREE.Scene, preview: BuildingDragPreview | null) => {
  if (!preview) return;
  scene.remove(preview.mesh);
  disposeScene(preview.mesh);
};

const makeTransparent = (object: THREE.Object3D) => {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.material) return;
    mesh.material = makeMaterialTransparent(mesh.material);
  });
};

const makeMaterialTransparent = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) return material.map(cloneTransparentMaterial);
  return cloneTransparentMaterial(material);
};

const cloneTransparentMaterial = (material: THREE.Material) => {
  const clone = material.clone();
  clone.transparent = true;
  clone.opacity = 0.58;
  clone.depthWrite = false;
  return clone;
};
