import * as THREE from 'three';

export const createSkyBodies = () => {
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(4, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd46b }),
  );
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xd8e4ff }),
  );
  return { sun, moon };
};

export const updateSkyBodies = (bodies: ReturnType<typeof createSkyBodies>, minuteOfDay: number) => {
  const hour = minuteOfDay / 60;
  const dayAngle = ((hour - 6) / 12) * Math.PI;
  const nightAngle = ((hour < 6 ? hour + 2 : hour - 22) / 8) * Math.PI;
  bodies.sun.visible = hour >= 5 && hour < 20;
  bodies.moon.visible = !bodies.sun.visible;
  bodies.sun.position.set(Math.cos(dayAngle) * 95, 48 + Math.sin(dayAngle) * 36, -115);
  bodies.moon.position.set(Math.cos(nightAngle) * 85, 54 + Math.sin(nightAngle) * 22, -120);
};
