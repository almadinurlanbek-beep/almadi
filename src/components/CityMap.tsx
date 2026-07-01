import { useMemo, useState } from 'react';
import { createCityTiles, isRoadCell, isWaterCell } from '../lib/cityMap';
import { buildings } from '../lib/gameData';
import { formatMoney } from '../lib/format';
import type { BuildingId, CityStats, TilePoint } from '../lib/gameTypes';
import { CityMap3D } from './CityMap3D';
import './CityMap.css';

type Props = {
  stats: CityStats;
  onDeleteBuilding: (buildingId: BuildingId, index: number) => void;
  onMoveBuilding: (buildingId: BuildingId, index: number, point: TilePoint) => void;
};

type SelectedBuilding = {
  buildingId: BuildingId;
  index: number;
};

export function CityMap({ stats, onDeleteBuilding, onMoveBuilding }: Props) {
  const [selected, setSelected] = useState<SelectedBuilding | null>(null);
  const [moving, setMoving] = useState(false);
  const tiles = useMemo(() => createCityTiles(stats), [stats]);
  const selectedInfo = selected ? buildings.find((building) => building.id === selected.buildingId) : null;

  const handleTileClick = (point: TilePoint) => {
    const tile = tiles.find((item) => item.x === point.x && item.y === point.y);
    if (moving && selected && canMoveTo(point, tile?.model)) {
      onMoveBuilding(selected.buildingId, selected.index, point);
      setMoving(false);
      return;
    }
    if (tile?.buildingId && tile.buildingIndex !== undefined) {
      setSelected({ buildingId: tile.buildingId, index: tile.buildingIndex });
      setMoving(false);
      return;
    }
    if (!moving) setSelected(null);
  };

  return (
    <section className="panel">
      <div className="map-title">
        <p className="eyebrow">3D карта города</p>
      </div>
      <CityMap3D stats={stats} onTileClick={handleTileClick} />
      {selected && selectedInfo && (
        <div className="building-actions">
          <strong>{selectedInfo.name}</strong>
          <button type="button" className="secondary" onClick={() => setMoving(true)}>
            Переместить
          </button>
          <button type="button" className="danger" onClick={() => onDeleteBuilding(selected.buildingId, selected.index)}>
            Удалить +{formatMoney(Math.round(selectedInfo.cost * 0.5))}
          </button>
          {moving && <small>Нажми на свободную клетку, куда перенести здание.</small>}
        </div>
      )}
    </section>
  );
}

const canMoveTo = (point: TilePoint, model?: string) => {
  return !isRoadCell(point.x, point.y) && !isWaterCell(point.x, point.y) && (!model || model === 'lot');
};
