import * as THREE from 'three';
import type { QuestMarkerKind } from './questMapMarkers';

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

export const createQuestLabel = (position: THREE.Vector3, kind: QuestMarkerKind, title: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'rgba(251, 250, 247, 0.94)';
    roundRect(context, 22, 76, 212, 34, 12);
    context.fill();
    context.strokeStyle = 'rgba(24, 32, 29, 0.14)';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = getQuestColor(kind);
    context.beginPath();
    context.arc(128, 45, 32, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#fbfaf7';
    context.lineWidth = 6;
    context.stroke();
    context.fillStyle = '#fbfaf7';
    context.font = '800 42px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(getQuestIcon(kind), 128, 47);
    context.fillStyle = '#1f453d';
    context.font = '800 18px Inter, sans-serif';
    context.fillText(trimTitle(title), 128, 94);
  }
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
  sprite.position.copy(position);
  sprite.scale.set(5.2, 2.6, 1);
  return sprite;
};

const getQuestColor = (kind: QuestMarkerKind) => {
  if (kind === 'ai') return '#4f6fd9';
  if (kind === 'hourly') return '#c48b35';
  return '#2f7d68';
};

const getQuestIcon = (kind: QuestMarkerKind) => {
  if (kind === 'ai') return 'AI';
  if (kind === 'hourly') return '!';
  return '?';
};

const trimTitle = (title: string) => {
  return title.length > 22 ? `${title.slice(0, 21)}...` : title;
};

const roundRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
};
