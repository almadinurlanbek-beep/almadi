import { isRoadCell, isWaterCell } from './cityMap';

export type QuestMarkerKind = 'mayor' | 'hourly' | 'ai';

export type QuestMapMarker = {
  id: string;
  kind: QuestMarkerKind;
  title: string;
  x: number;
  y: number;
};

const mapSize = 80;
const visibleAnchors = [
  { x: 8, y: 8 },
  { x: 15, y: 8 },
  { x: 21, y: 9 },
  { x: 27, y: 10 },
  { x: 9, y: 16 },
  { x: 16, y: 17 },
  { x: 23, y: 18 },
  { x: 29, y: 19 },
  { x: 8, y: 26 },
  { x: 15, y: 27 },
  { x: 24, y: 28 },
  { x: 30, y: 29 },
];

export const createQuestMapMarkers = (quests: Array<{ id: string; kind: QuestMarkerKind; title: string }>): QuestMapMarker[] => {
  const occupied = new Set<string>();
  return quests.map((quest, index) => {
    const point = findMarkerPoint(quest.id, index, occupied);
    occupied.add(`${point.x}-${point.y}`);
    return { ...quest, ...point };
  });
};

const findMarkerPoint = (id: string, index: number, occupied: Set<string>) => {
  const anchor = visibleAnchors[index % visibleAnchors.length];
  const visiblePoint = findOpenPoint(anchor.x, anchor.y, occupied, 16);
  if (visiblePoint) return visiblePoint;

  const seed = getHash(id) + index * 17;
  const startX = 7 + (seed % 24);
  const startY = 7 + (Math.floor(seed / 7) % 24);
  const fallbackPoint = findOpenPoint(startX, startY, occupied, mapSize);
  if (fallbackPoint) return fallbackPoint;

  return { x: 8 + index, y: 8 };
};

const findOpenPoint = (startX: number, startY: number, occupied: Set<string>, maxDistance: number) => {
  for (let distance = 0; distance < maxDistance; distance += 1) {
    for (let dx = -distance; dx <= distance; dx += 1) {
      for (let dy = -distance; dy <= distance; dy += 1) {
        const point = { x: startX + dx, y: startY + dy };
        if (isMarkerPoint(point.x, point.y, occupied)) return point;
      }
    }
  }
  return null;
};

const isMarkerPoint = (x: number, y: number, occupied: Set<string>) => {
  return x >= 0
    && x < mapSize
    && y >= 0
    && y < mapSize
    && !isRoadCell(x, y)
    && !isWaterCell(x, y)
    && !occupied.has(`${x}-${y}`);
};

const getHash = (value: string) => {
  return [...value].reduce((total, char) => total + char.charCodeAt(0) * 31, 0);
};
