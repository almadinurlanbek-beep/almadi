import * as THREE from 'three';
import { cellSize, cityCenter } from './cityGrid3d';
import type { TilePoint } from './gameTypes';

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export const pickTileFromPointer = (event: PointerEvent, element: HTMLElement, camera: THREE.Camera): TilePoint | null => {
  const bounds = element.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const point = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(ground, point)) return null;
  return {
    x: Math.round(point.x / cellSize + cityCenter),
    y: Math.round(point.z / cellSize + cityCenter),
  };
};
