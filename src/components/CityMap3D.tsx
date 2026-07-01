import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { buildCityScene, updateCityScene } from '../lib/cityScene3d';
import { applyDayNightLights, getDayNightLights } from '../lib/cityDayNight3d';
import { tileToPosition } from '../lib/cityGrid3d';
import { pickTileFromPointer } from '../lib/cityMapPicking3d';
import { createSkyBodies, updateSkyBodies } from '../lib/citySkyBodies3d';
import { createCityTiles } from '../lib/cityMap';
import type { CityStats, TilePoint } from '../lib/gameTypes';
import { disposeScene } from '../lib/threeDispose';
type DragMode = 'pan' | 'rotate' | 'zoom';
export function CityMap3D({ stats, onTileClick }: { stats: CityStats; onTileClick: (point: TilePoint) => void }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef(tileToPosition(8, 8));
  const minuteRef = useRef(stats.minuteOfDay);
  const sceneKey = useMemo(
    () => JSON.stringify({
      buildings: stats.buildings,
      positions: stats.buildingPositions,
      construction: stats.construction.map((job) => job.id),
      incident: stats.activeIncident?.id,
      responses: stats.incidentResponses.map((response) => response.method),
    }),
    [stats.activeIncident?.id, stats.buildings, stats.buildingPositions, stats.construction, stats.incidentResponses],
  );
  useEffect(() => {
    minuteRef.current = stats.minuteOfDay;
  }, [stats.minuteOfDay]);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const scene = new THREE.Scene();
    const initialLights = getDayNightLights(stats.minuteOfDay);
    scene.background = initialLights.sky;
    const fog = new THREE.Fog(initialLights.fog, 140, 360);
    scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(48, host.clientWidth / host.clientHeight, 0.1, 420);
    const orbit = { yaw: 0.56, distance: 34, height: 30 };
    const applyCamera = () => {
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
    const entities = buildCityScene(scene, createCityTiles(stats), stats);
    const drag: { active: boolean; mode: DragMode; x: number; y: number } = {
      active: false,
      mode: 'pan',
      x: 0,
      y: 0,
    };
    let moved = false;
    const resize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const render = (timeMs: number) => {
      updateCityScene(scene, entities, timeMs / 1000);
      applyDayNightLights(scene, fog, hemi, sun, minuteRef.current);
      updateSkyBodies(skyBodies, minuteRef.current);
      applyCamera();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    const onPointerDown = (event: PointerEvent) => {
      drag.active = true;
      drag.mode = event.button === 2 ? 'rotate' : event.button === 1 ? 'zoom' : 'pan';
      drag.x = event.clientX;
      drag.y = event.clientY;
      moved = false;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      if (drag.mode === 'rotate') {
        orbit.yaw -= dx * 0.01;
        orbit.height = Math.max(14, Math.min(70, orbit.height + dy * 0.08));
      } else if (drag.mode === 'zoom') {
        orbit.distance = Math.max(12, Math.min(95, orbit.distance + dy * 0.12));
      } else {
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
      orbit.distance = Math.max(10, Math.min(110, orbit.distance + event.deltaY * 0.035));
      orbit.height = Math.max(12, Math.min(82, orbit.height + event.deltaY * 0.018));
    };
    const stopDrag = (event: PointerEvent) => {
      const wasClick = drag.active && !moved && drag.mode === 'pan';
      drag.active = false;
      if (wasClick) pickTile(event);
    };
    const preventMenu = (event: MouseEvent) => event.preventDefault();
    const pickTile = (event: PointerEvent) => {
      const point = pickTileFromPointer(event, renderer.domElement, camera);
      if (point) onTileClick(point);
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
      disposeScene(scene);
      renderer.dispose();
      host.replaceChildren();
    };
  }, [sceneKey]);
  return <div className="city-3d-viewport" ref={hostRef} />;
}
