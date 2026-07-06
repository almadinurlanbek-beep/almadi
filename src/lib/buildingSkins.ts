import * as THREE from 'three';
import type { BuildingId, BuildingSkinId } from './gameTypes';

export type BuildingSkin = {
  id: BuildingSkinId;
  name: string;
  color: string;
  tint: number;
  roof: number;
};

export const buildingSkins: BuildingSkin[] = [
  { id: 'classic', name: 'Классика', color: '#d8c7a2', tint: 0xd8c7a2, roof: 0x7d5d4c },
  { id: 'modern', name: 'Модерн', color: '#7fb7d6', tint: 0x7fb7d6, roof: 0x263943 },
  { id: 'gold', name: 'Золотой', color: '#d6a84a', tint: 0xd6a84a, roof: 0x7c4b09 },
];

export const defaultBuildingSkins = {
  homes: 'classic',
  schools: 'classic',
  hospitals: 'classic',
  police: 'classic',
  fireStations: 'classic',
  parks: 'classic',
  factories: 'classic',
  shops: 'classic',
  malls: 'classic',
  airports: 'classic',
  stations: 'classic',
  militaryBases: 'classic',
  stadiums: 'classic',
  universities: 'classic',
  banks: 'classic',
  ports: 'classic',
  museums: 'classic',
} satisfies Record<BuildingId, BuildingSkinId>;

export const applyBuildingSkin = (model: THREE.Group, skinId: BuildingSkinId) => {
  if (skinId === 'classic') return model;
  const skin = buildingSkins.find((item) => item.id === skinId) ?? buildingSkins[0];
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const nextMaterials = materials.map((material) => tintMaterial(material, skin));
    object.material = Array.isArray(object.material) ? nextMaterials : nextMaterials[0];
  });
  return model;
};

const tintMaterial = (material: THREE.Material, skin: BuildingSkin) => {
  const next = material.clone();
  if ('color' in next && next.color instanceof THREE.Color && !('map' in next && next.map)) {
    next.color.lerp(new THREE.Color(skin.tint), 0.48);
  }
  if ('emissive' in next && next.emissive instanceof THREE.Color) {
    next.emissive.lerp(new THREE.Color(skin.roof), 0.18);
  }
  return next;
};
