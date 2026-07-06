import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { buildCityScene, updateCityScene } from '../lib/cityScene3d';
import { applyDayNightLights, getDayNightLights } from '../lib/cityDayNight3d';
import { tileToPosition } from '../lib/cityGrid3d';
import { pickTileFromPointer } from '../lib/cityMapPicking3d';
import { createSkyBodies, updateSkyBodies } from '../lib/citySkyBodies3d';
import { createQuestLabel } from '../lib/cityLabels3d';
import type { MapTile } from '../lib/cityMap';
import { createBuildingDragPreview, removeBuildingDragPreview, updateBuildingDragPreview, type BuildingDragPreview } from '../lib/cityDragPreview3d';
import type { BuildingId, CityStats, TilePoint } from '../lib/gameTypes';
import type { QuestMapMarker } from '../lib/questMapMarkers';
import { disposeScene } from '../lib/threeDispose';
type DragMode = 'pan' | 'rotate' | 'zoom';
type DraggedBuilding = {
  buildingId: BuildingId;
  index: number;
};
type CameraOrbit = {
  yaw: number;
  distance: number;
  height: number;
};
type Props = {
  stats: CityStats;
  tiles: MapTile[];
  questMarkers: QuestMapMarker[];
  onTileClick: (point: TilePoint) => void;
  onQuestMarkerClick: (questId: string) => void;
  onBuildingDragStart: (point: TilePoint) => DraggedBuilding | null;
  onBuildingDrop: (building: DraggedBuilding, point: TilePoint) => void;
};

export function CityMap3D({ stats, tiles, questMarkers, onTileClick, onQuestMarkerClick, onBuildingDragStart, onBuildingDrop }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef(tileToPosition(8, 8));
  const orbitRef = useRef<CameraOrbit>({ yaw: 0.56, distance: 34, height: 30 });
  const minuteRef = useRef(stats.minuteOfDay);
  const tileClickRef = useRef(onTileClick);
  const questClickRef = useRef(onQuestMarkerClick);
  const dragStartRef = useRef(onBuildingDragStart);
  const dropRef = useRef(onBuildingDrop);
  const sceneKey = useMemo(
    () => JSON.stringify({
      buildings: stats.buildings,
      skins: stats.buildingSkins,
      positions: stats.buildingPositions,
      questMarkers: questMarkers.map((marker) => `${marker.id}:${marker.kind}:${marker.title}:${marker.x}:${marker.y}`),
      construction: stats.construction.map((job) => job.id),
      incident: stats.activeIncident?.id,
      responses: stats.incidentResponses.map((response) => response.method),
    }),
    [questMarkers, stats.activeIncident?.id, stats.buildings, stats.buildingSkins, stats.buildingPositions, stats.construction, stats.incidentResponses],
  );
  useEffect(() => {
    minuteRef.current = stats.minuteOfDay;
  }, [stats.minuteOfDay]);
  useEffect(() => {
    tileClickRef.current = onTileClick;
    questClickRef.current = onQuestMarkerClick;
    dragStartRef.current = onBuildingDragStart;
    dropRef.current = onBuildingDrop;
  }, [onTileClick, onQuestMarkerClick, onBuildingDragStart, onBuildingDrop]);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const scene = new THREE.Scene();
    const initialLights = getDayNightLights(stats.minuteOfDay);
    scene.background = initialLights.sky;
    const fog = new THREE.Fog(initialLights.fog, 140, 360);
    scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(48, host.clientWidth / host.clientHeight, 0.1, 420);
    const applyCamera = () => {
      const orbit = orbitRef.current;
      camera.position.set(
        targetRef.current.x + Math.sin(orbit.yaw) * orbit.distance,
        orbit.height,
        targetRef.current.z + Math.cos(orbit.yaw) * orbit.distance,
      );
      camera.lookAt(targetRef.current);
    };
    applyCamera();
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: navigator.userAgent.includes('HeadlessChrome'),
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);
    const hemi = new THREE.HemisphereLight(0xf8fff7, 0x6f806b, initialLights.hemiIntensity);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(initialLights.sunColor, initialLights.sunIntensity);
    sun.position.set(40, initialLights.sunY, 20);
    scene.add(sun);
    const skyBodies = createSkyBodies();
    scene.add(skyBodies.sun, skyBodies.moon);
    applyDayNightLights(scene, fog, hemi, sun, stats.minuteOfDay);
    const entities = buildCityScene(scene, tiles, stats);
    questMarkers.forEach((marker) => {
      scene.add(createQuestLabel(tileToPosition(marker.x, marker.y, 3.8), marker.kind, marker.title, marker.completed));
    });
    const drag: { active: boolean; mode: DragMode; x: number; y: number } = {
      active: false,
      mode: 'pan',
      x: 0,
      y: 0,
    };
    const buildingDrag: { active: boolean; item: DraggedBuilding | null } = {
      active: false,
      item: null,
    };
    let dragPreview: BuildingDragPreview | null = null;
    let moved = false;
    const resize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    let lastRenderMs = 0;
    const render = (timeMs: number) => {
      if (timeMs - lastRenderMs < 33) {
        frame = requestAnimationFrame(render);
        return;
      }
      lastRenderMs = timeMs;
      updateCityScene(scene, entities, timeMs / 1000);
      applyDayNightLights(scene, fog, hemi, sun, minuteRef.current);
      updateSkyBodies(skyBodies, minuteRef.current);
      applyCamera();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button === 0) {
        const point = pickTileFromPointer(event, renderer.domElement, camera);
        const building = point ? dragStartRef.current(point) : null;
        if (building && point) {
          buildingDrag.active = true;
          buildingDrag.item = building;
          removeBuildingDragPreview(scene, dragPreview);
          dragPreview = createBuildingDragPreview(building.buildingId, point);
          scene.add(dragPreview.mesh);
          moved = false;
          renderer.domElement.setPointerCapture(event.pointerId);
          return;
        }
      }
      drag.active = true;
      drag.mode = event.button === 2 ? 'rotate' : event.button === 1 ? 'zoom' : 'pan';
      drag.x = event.clientX;
      drag.y = event.clientY;
      moved = false;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (buildingDrag.active) {
        const point = pickTileFromPointer(event, renderer.domElement, camera);
        if (point && dragPreview) updateBuildingDragPreview(dragPreview, point);
        moved = true;
        return;
      }
      if (!drag.active) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      if (drag.mode === 'rotate') {
        orbitRef.current.yaw -= dx * 0.01;
        orbitRef.current.height = Math.max(14, Math.min(70, orbitRef.current.height + dy * 0.08));
      } else if (drag.mode === 'zoom') {
        orbitRef.current.distance = Math.max(12, Math.min(95, orbitRef.current.distance + dy * 0.12));
      } else {
        const orbit = orbitRef.current;
        const right = new THREE.Vector3(Math.cos(orbit.yaw), 0, -Math.sin(orbit.yaw));
        const forward = new THREE.Vector3(Math.sin(orbit.yaw), 0, Math.cos(orbit.yaw));
        targetRef.current.add(right.multiplyScalar(-dx * 0.09));
        targetRef.current.add(forward.multiplyScalar(-dy * 0.09));
      }
      drag.x = event.clientX;
      drag.y = event.clientY;
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      orbitRef.current.distance = Math.max(10, Math.min(110, orbitRef.current.distance + event.deltaY * 0.035));
      orbitRef.current.height = Math.max(12, Math.min(82, orbitRef.current.height + event.deltaY * 0.018));
    };
    const stopDrag = (event: PointerEvent) => {
      if (buildingDrag.active) {
        const point = pickTileFromPointer(event, renderer.domElement, camera);
        if (buildingDrag.item && point) dropRef.current(buildingDrag.item, point);
        removeBuildingDragPreview(scene, dragPreview);
        dragPreview = null;
        buildingDrag.active = false;
        buildingDrag.item = null;
        return;
      }
      const wasClick = drag.active && !moved && drag.mode === 'pan';
      drag.active = false;
      if (wasClick) pickTile(event);
    };
    const preventMenu = (event: MouseEvent) => event.preventDefault();
    const pickTile = (event: PointerEvent) => {
      const point = pickTileFromPointer(event, renderer.domElement, camera);
      if (!point) return;
      const questMarker = findQuestMarkerNear(point, questMarkers);
      if (questMarker) {
        questClickRef.current(questMarker.id);
        return;
      }
      tileClickRef.current(point);
    };
    let frame = requestAnimationFrame(render);
    window.addEventListener('resize', resize);
    renderer.domElement.addEventListener('contextmenu', preventMenu);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', stopDrag);
    renderer.domElement.addEventListener('pointercancel', stopDrag);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      removeBuildingDragPreview(scene, dragPreview);
      disposeScene(scene);
      renderer.dispose();
      host.replaceChildren();
    };
  }, [sceneKey, tiles]);
  return <div className="city-3d-viewport" ref={hostRef} />;
}

const findQuestMarkerNear = (point: TilePoint, markers: QuestMapMarker[]) => {
  return markers.find((marker) => Math.max(Math.abs(marker.x - point.x), Math.abs(marker.y - point.y)) <= 2) ?? null;
};
