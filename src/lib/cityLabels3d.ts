import * as THREE from 'three';

export const createCountLabel = (text: string, position: THREE.Vector3) => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#fbfaf7';
    context.beginPath();
    context.arc(32, 32, 22, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#1f453d';
    context.font = '700 28px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 32, 33);
  }
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
  sprite.position.copy(position);
  sprite.scale.set(1.2, 1.2, 1.2);
  return sprite;
};
