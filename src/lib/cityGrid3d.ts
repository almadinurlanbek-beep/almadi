import * as THREE from 'three';

export const cellSize = 2.2;
export const cityCenter = 39.5;
export const fireTile = { x: 13, y: 13 };
export const fireRoadTile = { x: 12, y: 14 };

export const tileToPosition = (x: number, y: number, height = 0) => (
  new THREE.Vector3((x - cityCenter) * cellSize, height, (y - cityCenter) * cellSize)
);
