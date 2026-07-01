import * as THREE from 'three';

export type FireCrewRig = {
  firefighters: THREE.Group[];
  hose: THREE.Object3D;
  water: THREE.Object3D;
};

export const createFireCrewRig = () => {
  const rig: FireCrewRig = {
    firefighters: [createFirefighter(), createFirefighter()],
    hose: createHose(),
    water: createWaterJet(),
  };

  rig.firefighters[0].position.set(-0.55, 0, -0.75);
  rig.firefighters[1].position.set(-0.1, 0, 0.75);
  rig.hose.position.set(-1.08, 0.08, 0);
  rig.water.position.set(-1.18, 0.72, 0);
  rig.hose.visible = false;
  rig.water.visible = false;
  rig.firefighters.forEach((firefighter) => { firefighter.visible = false; });
  return rig;
};

export const updateFireCrew = (rig: FireCrewRig | undefined, progress: number, time: number) => {
  if (!rig) return;
  const deployed = progress > 0;
  rig.hose.visible = deployed;
  rig.water.visible = progress >= 1;
  rig.firefighters.forEach((firefighter, index) => {
    const side = index === 0 ? -1 : 1;
    firefighter.visible = deployed;
    firefighter.position.x = -0.55 - progress * (0.7 + index * 0.2);
    firefighter.position.z = side * (0.75 - progress * 0.45);
    firefighter.rotation.y = Math.PI / 2 + Math.sin(time * 4 + index) * 0.12;
    firefighter.children.forEach((part) => {
      part.rotation.z = Math.sin(time * 7 + index) * 0.08 * progress;
    });
  });
  rig.water.scale.set(1, 1 + Math.sin(time * 16) * 0.08, 1);
};

const createFirefighter = () => {
  const group = new THREE.Group();
  const suit = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.34, 4, 8), new THREE.MeshLambertMaterial({ color: 0xc44631 }));
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshLambertMaterial({ color: 0xf4c542 }));
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.04), new THREE.MeshBasicMaterial({ color: 0x1e2c32 }));
  suit.position.y = 0.34;
  helmet.position.y = 0.72;
  visor.position.set(0, 0.73, -0.12);
  group.add(suit, helmet, visor);
  return group;
};

const createHose = () => {
  const hose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 1.7, 12),
    new THREE.MeshLambertMaterial({ color: 0x2e3030 }),
  );
  hose.rotation.z = Math.PI / 2;
  return hose;
};

const createWaterJet = () => {
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.09, 2.3, 8),
    new THREE.MeshBasicMaterial({ color: 0x7fd4ff, transparent: true, opacity: 0.72 }),
  );
  water.rotation.z = Math.PI / 2.8;
  return water;
};
