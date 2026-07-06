import { useEffect, useMemo, useState } from 'react';
import { createCityTiles } from '../lib/cityMap';
import { buildings } from '../lib/gameData';
import { formatMoney } from '../lib/format';
import type { BuildingId, CityStats, TilePoint } from '../lib/gameTypes';
import type { QuestMapMarker } from '../lib/questMapMarkers';
import { CityMap3D } from './CityMap3D';
import './CityMap.css';

type Props = {
  readOnly?: boolean;
  questMarkers: QuestMapMarker[];
  stats: CityStats;
  onDeleteBuilding: (buildingId: BuildingId, index: number) => void;
  onQuestMarkerClick: (questId: string) => void;
  onMoveBuilding: (buildingId: BuildingId, index: number, point: TilePoint) => void;
  onRotateBuilding: (buildingId: BuildingId, index: number, point: TilePoint) => void;
};

type SelectedBuilding = {
  buildingId: BuildingId;
  index: number;
  point: TilePoint;
};

const hitboxRadius = 5;

export function CityMap({ readOnly = false, questMarkers, stats, onDeleteBuilding, onQuestMarkerClick, onMoveBuilding, onRotateBuilding }: Props) {
  const [selected, setSelected] = useState<SelectedBuilding | null>(null);
  const [moving, setMoving] = useState(false);
  const mapKey = useMemo(
    () => JSON.stringify({ buildings: stats.buildings, positions: stats.buildingPositions }),
    [stats.buildings, stats.buildingPositions],
  );
  const tiles = useMemo(() => createCityTiles(stats), [mapKey]);
  const selectedInfo = selected ? buildings.find((building) => building.id === selected.buildingId) : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
    if (readOnly || event.key.toLowerCase() !== 'r' || !selected) return;
      event.preventDefault();
      onRotateBuilding(selected.buildingId, selected.index, selected.point);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRotateBuilding, selected]);

  const handleTileClick = (point: TilePoint) => {
    const building = findBuildingNear(point, tiles);
    if (building) {
      setSelected(building);
      setMoving(false);
      return;
    }
    if (!moving) setSelected(null);
  };

  const handleBuildingDragStart = (point: TilePoint) => {
    if (readOnly || !moving || !selected) return null;
    const building = findBuildingNear(point, tiles);
    const isSelectedBuilding = building?.buildingId === selected.buildingId && building.index === selected.index;
    return isSelectedBuilding ? selected : null;
  };

  const handleBuildingDrop = (building: Omit<SelectedBuilding, 'point'>, point: TilePoint) => {
    onMoveBuilding(building.buildingId, building.index, point);
    setMoving(false);
    setSelected(selected && selected.buildingId === building.buildingId && selected.index === building.index ? selected : null);
  };

  const handleDelete = () => {
    if (!selected) return;
    onDeleteBuilding(selected.buildingId, selected.index);
    setSelected(null);
    setMoving(false);
  };

  return (
    <section className="panel map-panel">
      <div className="map-title">
        <p className="eyebrow">3D карта города</p>
        {!readOnly && questMarkers.length > 0 && <small>Квесты отмечены на карте значками. Нажми на маркер, чтобы открыть задание.</small>}
      </div>
      <div className="map-stage">
        <CityMap3D
          questMarkers={readOnly ? [] : questMarkers}
          stats={stats}
          tiles={tiles}
          onTileClick={handleTileClick}
          onQuestMarkerClick={onQuestMarkerClick}
          onBuildingDragStart={handleBuildingDragStart}
          onBuildingDrop={handleBuildingDrop}
        />
        {!readOnly && questMarkers.length > 0 && (
          <div className="map-quest-overlay" aria-label="Квесты на карте">
            {questMarkers.slice(0, 8).map((marker) => (
              <button
                type="button"
                className={`map-quest-marker ${marker.kind}`}
                key={marker.id}
                title={marker.title}
                onClick={() => onQuestMarkerClick(marker.id)}
              >
                <span>{getQuestMarkerIcon(marker)}</span>
                <strong>{marker.title}</strong>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected && selectedInfo && (
        <div className="building-actions">
          <strong>{selectedInfo.name}</strong>
          {!readOnly && (
            <>
              <button type="button" className="secondary" onClick={() => setMoving(true)}>
                Переместить
              </button>
              <button type="button" className="danger" onClick={handleDelete}>
                Удалить +{formatMoney(Math.round(selectedInfo.cost * 0.5))}
              </button>
            </>
          )}
          <small>{readOnly ? 'Это город друга: его можно смотреть, но нельзя менять.' : moving ? 'Зажми выбранное здание, перетащи на свободную клетку и отпусти мышку.' : 'Нажми R, чтобы повернуть выбранное здание.'}</small>
        </div>
      )}
    </section>
  );
}

const findBuildingNear = (point: TilePoint, tiles: ReturnType<typeof createCityTiles>): SelectedBuilding | null => {
  const exact = tiles.find((tile) => tile.x === point.x && tile.y === point.y);
  if (exact?.buildingId && exact.buildingIndex !== undefined) {
    return { buildingId: exact.buildingId, index: exact.buildingIndex, point: exact };
  }

  let nearest: SelectedBuilding | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  tiles.forEach((tile) => {
    if (!tile.buildingId || tile.buildingIndex === undefined) return;
    const distance = Math.max(Math.abs(tile.x - point.x), Math.abs(tile.y - point.y));
    if (distance > hitboxRadius) return;
    if (distance < nearestDistance) {
      nearest = { buildingId: tile.buildingId, index: tile.buildingIndex, point: tile };
      nearestDistance = distance;
    }
  });
  return nearest;
};

const getQuestMarkerIcon = (marker: QuestMapMarker) => {
  if (marker.completed) return '✓';
  const { kind } = marker;
  if (kind === 'ai') return 'AI';
  if (kind === 'hourly') return '!';
  return '?';
};
