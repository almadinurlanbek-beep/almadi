import * as THREE from 'three';

export const disposeScene = (scene: THREE.Object3D) => {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    disposeMaterial(mesh.material);
  });
};

const disposeMaterial = (material?: THREE.Material | THREE.Material[]) => {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach(disposeSingleMaterial);
    return;
  }
  disposeSingleMaterial(material);
};

const disposeSingleMaterial = (material: THREE.Material) => {
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) value.dispose();
  });
  material.dispose();
};
