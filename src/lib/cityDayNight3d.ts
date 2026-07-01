import * as THREE from 'three';

export type DayNightLights = {
  sky: THREE.Color;
  fog: THREE.Color;
  hemiIntensity: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  sunY: number;
  moonVisible: boolean;
  sunVisible: boolean;
};

export const getDayNightLights = (minuteOfDay: number): DayNightLights => {
  const hour = minuteOfDay / 60;
  if (hour < 5 || hour >= 22) return createLights(0x090f1f, 0x10182c, 0.25, 0x9bbcff, 0.18, 18, false, true);
  if (hour < 7) return createLights(0xf0b27a, 0xc99577, 1.1, 0xffcf8b, 1.1, 34, true, false);
  if (hour < 18) return createLights(0xdde8e0, 0xdde8e0, 2.1, 0xffffff, 2.2, 80, true, false);
  if (hour < 20) return createLights(0xf0a66e, 0xd49a77, 1.35, 0xffb36b, 1.3, 36, true, false);
  return createLights(0x18233c, 0x202b45, 0.55, 0x8aa8ff, 0.4, 22, false, true);
};

export const applyDayNightLights = (
  scene: THREE.Scene,
  fog: THREE.Fog,
  hemi: THREE.HemisphereLight,
  sun: THREE.DirectionalLight,
  minuteOfDay: number,
) => {
  const lights = getDayNightLights(minuteOfDay);
  scene.background = lights.sky;
  fog.color.copy(lights.fog);
  hemi.intensity = lights.hemiIntensity;
  sun.color.copy(lights.sunColor);
  sun.intensity = lights.sunIntensity;
  sun.position.set(40, lights.sunY, 20);
};

const createLights = (
  sky: number,
  fog: number,
  hemiIntensity: number,
  sunColor: number,
  sunIntensity: number,
  sunY: number,
  sunVisible: boolean,
  moonVisible: boolean,
) => ({
  sky: new THREE.Color(sky),
  fog: new THREE.Color(fog),
  hemiIntensity,
  sunColor: new THREE.Color(sunColor),
  sunIntensity,
  sunY,
  sunVisible,
  moonVisible,
});
