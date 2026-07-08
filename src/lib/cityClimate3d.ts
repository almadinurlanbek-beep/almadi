import * as THREE from 'three';
import { getCountry } from './countries';
import { cellSize, cityCenter, tileToPosition } from './cityGrid3d';
import type { CityStats, CountryClimate } from './gameTypes';

type ClimatePalette = {
  home: number;
  lot: number;
  nature: number;
  road: number;
  service: number;
  water: number;
  work: number;
};

const defaultPalette: ClimatePalette = {
  home: 0xd7c2a7,
  lot: 0xa9c69d,
  nature: 0x79ad69,
  road: 0x555d60,
  service: 0xcdd6da,
  water: 0x4ea8b5,
  work: 0xc8b990,
};

const palettes: Record<CountryClimate, ClimatePalette> = {
  alpine: { ...defaultPalette, lot: 0xa8c39a, nature: 0x5d9a61, water: 0x6bbfd0 },
  'coastal-desert': { ...defaultPalette, lot: 0xd9bd74, home: 0xd7b982, nature: 0x9fb56b, water: 0x4aaec2, work: 0xcfaa61 },
  'desert-oasis': { ...defaultPalette, lot: 0xd5b56d, home: 0xd0aa6f, nature: 0x95aa55, water: 0x4db5b7, work: 0xc6a35f },
  islands: { ...defaultPalette, lot: 0xb9d5a6, nature: 0x66b777, water: 0x3d9ec0 },
  mediterranean: { ...defaultPalette, lot: 0xbacb8c, nature: 0x7fa95e, work: 0xcdb276 },
  monsoon: { ...defaultPalette, lot: 0x95c58c, nature: 0x48a360, water: 0x4ca8be },
  'northern-fjords': { ...defaultPalette, lot: 0x91aa9b, nature: 0x4f856b, water: 0x4e93a8, home: 0xb9c2bd },
  savanna: { ...defaultPalette, lot: 0xc7b46d, nature: 0x9aa753, work: 0xc3a365 },
  'steppe-mountains': { ...defaultPalette, lot: 0xb8bf74, nature: 0x8faa4d, home: 0xcbb784, work: 0xc4b06b },
  'taiga-snow': { ...defaultPalette, lot: 0xd5ded4, nature: 0x5d8a71, home: 0xc6d0ce, road: 0x59646a, water: 0x80b9c7 },
  'temperate-forest': defaultPalette,
  'tropical-forest': { ...defaultPalette, lot: 0x7fc276, nature: 0x2f9151, water: 0x35a8b1 },
};

export const getClimatePalette = (countryId: string) => palettes[getCountry(countryId).climate] ?? defaultPalette;

export const createClimateScenery = (stats: CityStats) => {
  const climate = getCountry(stats.countryId).climate;
  const group = new THREE.Group();
  group.name = `climate-${climate}`;
  addMountainRim(group, getMountainRockColor(climate), getMountainSnowColor(climate));

  if (climate === 'steppe-mountains') {
    addGrassWaves(group, 0xb3ad4d, 0x738a34, 90);
  } else if (climate === 'taiga-snow') {
    addPineForest(group, 0x2f604c, 80, true);
  } else if (climate === 'desert-oasis' || climate === 'coastal-desert') {
    addDunes(group);
    addOasisPalms(group, climate === 'coastal-desert');
  } else if (climate === 'tropical-forest' || climate === 'monsoon') {
    addPineForest(group, 0x247a3b, 110, false);
    addRainPools(group);
  } else if (climate === 'islands') {
    addIslandCoast(group);
    addOasisPalms(group, true);
  } else if (climate === 'northern-fjords') {
    addFjordWater(group);
  } else if (climate === 'savanna') {
    addGrassWaves(group, 0xc0a94d, 0x7e8c3b, 70);
    addAcaciaTrees(group);
  } else if (climate === 'alpine') {
    addPineForest(group, 0x3d7452, 58, false);
  } else if (climate === 'mediterranean') {
    addVineRows(group);
    addLowHills(group);
  } else {
    addPineForest(group, 0x4f8b55, 42, false);
  }

  return group;
};

const addMountainRim = (group: THREE.Group, rockColor: number, snowColor: number) => {
  const anchors = createMountainAnchors();
  const rockMesh = new THREE.InstancedMesh(
    new THREE.ConeGeometry(4.6, 1, 4),
    new THREE.MeshLambertMaterial({ color: rockColor }),
    anchors.length,
  );
  const snowMesh = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.85, 1, 4),
    new THREE.MeshLambertMaterial({ color: snowColor }),
    anchors.length,
  );
  const dummy = new THREE.Object3D();

  anchors.forEach((anchor, index) => {
    const height = 5.2 + (index % 5) * 0.9 + (index % 2) * 0.7;
    dummy.position.copy(tileToPosition(anchor.x, anchor.y, height / 2 - 0.18));
    dummy.rotation.y = Math.PI / 4 + (index % 3) * 0.18;
    dummy.scale.set(0.86 + (index % 4) * 0.1, height, 0.92 + (index % 5) * 0.08);
    dummy.updateMatrix();
    rockMesh.setMatrixAt(index, dummy.matrix);

    dummy.position.copy(tileToPosition(anchor.x, anchor.y, height - 0.46));
    dummy.rotation.y = Math.PI / 4 + (index % 3) * 0.18;
    dummy.scale.set(0.8 + (index % 3) * 0.08, height * 0.32, 0.82 + (index % 4) * 0.07);
    dummy.updateMatrix();
    snowMesh.setMatrixAt(index, dummy.matrix);
  });

  rockMesh.instanceMatrix.needsUpdate = true;
  snowMesh.instanceMatrix.needsUpdate = true;
  group.add(rockMesh, snowMesh);
};

const createMountainAnchors = () => {
  const anchors: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < 12; index += 1) {
    const offset = 3 + index * 7;
    anchors.push({ x: offset, y: -10 - (index % 3) });
    anchors.push({ x: offset, y: 89 + (index % 3) });
  }
  for (let index = 0; index < 10; index += 1) {
    const offset = 6 + index * 7;
    anchors.push({ x: -10 - (index % 3), y: offset });
    anchors.push({ x: 89 + (index % 3), y: offset });
  }
  return anchors;
};

const getMountainRockColor = (climate: CountryClimate) => {
  if (climate === 'desert-oasis' || climate === 'coastal-desert' || climate === 'savanna') return 0xb79761;
  if (climate === 'taiga-snow' || climate === 'northern-fjords') return 0x77898d;
  if (climate === 'steppe-mountains') return 0x7d8273;
  return 0x727c74;
};

const getMountainSnowColor = (climate: CountryClimate) => {
  if (climate === 'desert-oasis' || climate === 'coastal-desert' || climate === 'savanna') return 0xe8d9ad;
  if (climate === 'taiga-snow' || climate === 'northern-fjords') return 0xffffff;
  return 0xf0f3e8;
};

const addGrassWaves = (group: THREE.Group, dryColor: number, greenColor: number, count: number) => {
  for (let index = 0; index < count; index += 1) {
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.8 + (index % 3) * 0.2, 5),
      new THREE.MeshLambertMaterial({ color: index % 4 === 0 ? greenColor : dryColor }),
    );
    const x = (index * 13) % 78;
    const y = 58 + ((index * 7) % 18);
    blade.position.copy(tileToPosition(x, y, 0.35));
    blade.rotation.z = ((index % 5) - 2) * 0.12;
    group.add(blade);
  }
};

const addPineForest = (group: THREE.Group, color: number, count: number, snow: boolean) => {
  for (let index = 0; index < count; index += 1) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.65, 6), new THREE.MeshLambertMaterial({ color: 0x71513a }));
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.7, 7), new THREE.MeshLambertMaterial({ color }));
    trunk.position.y = 0.32;
    crown.position.y = 1.25;
    tree.add(trunk, crown);
    if (snow) {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.55, 7), new THREE.MeshLambertMaterial({ color: 0xf4f8fb }));
      cap.position.y = 1.85;
      tree.add(cap);
    }
    const x = (index * 17) % 80;
    const y = index % 2 === 0 ? -5 - (index % 10) : 84 + (index % 8);
    tree.position.copy(tileToPosition(x, y, 0));
    group.add(tree);
  }
};

const addDunes = (group: THREE.Group) => {
  const material = new THREE.MeshLambertMaterial({ color: 0xd1ad62 });
  for (let index = 0; index < 8; index += 1) {
    const dune = new THREE.Mesh(new THREE.SphereGeometry(6 + index % 3, 12, 6), material);
    dune.scale.y = 0.16;
    dune.position.copy(tileToPosition(8 + index * 10, 86 + (index % 2) * 4, 0.12));
    group.add(dune);
  }
};

const addOasisPalms = (group: THREE.Group, moreWater: boolean) => {
  if (moreWater) {
    const water = new THREE.Mesh(new THREE.CircleGeometry(8, 28), new THREE.MeshLambertMaterial({ color: 0x42a9b5 }));
    water.rotation.x = -Math.PI / 2;
    water.position.copy(tileToPosition(72, 70, 0.1));
    group.add(water);
  }
  for (let index = 0; index < 9; index += 1) group.add(createPalm(64 + index, 64 + (index * 5) % 14));
};

const createPalm = (x: number, y: number) => {
  const palm = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 2.2, 6), new THREE.MeshLambertMaterial({ color: 0x9b6f43 }));
  trunk.position.y = 1.1;
  palm.add(trunk);
  for (let index = 0; index < 5; index += 1) {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.34), new THREE.MeshLambertMaterial({ color: 0x3f8f45 }));
    leaf.position.y = 2.25;
    leaf.rotation.y = (Math.PI * 2 * index) / 5;
    leaf.rotation.z = 0.18;
    palm.add(leaf);
  }
  palm.position.copy(tileToPosition(x, y, 0));
  return palm;
};

const addRainPools = (group: THREE.Group) => {
  const material = new THREE.MeshLambertMaterial({ color: 0x4aa6b4 });
  for (let index = 0; index < 5; index += 1) {
    const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4 + index * 0.25, 18), material);
    pool.rotation.x = -Math.PI / 2;
    pool.position.copy(tileToPosition(6 + index * 15, 82, 0.09));
    group.add(pool);
  }
};

const addIslandCoast = (group: THREE.Group) => {
  const water = new THREE.Mesh(new THREE.RingGeometry(84, 96, 64), new THREE.MeshLambertMaterial({ color: 0x359fbd, side: THREE.DoubleSide }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.04, 0);
  group.add(water);
};

const addFjordWater = (group: THREE.Group) => {
  const fjord = new THREE.Mesh(new THREE.BoxGeometry(cellSize * 12, 0.06, cellSize * 94), new THREE.MeshLambertMaterial({ color: 0x4c8aa2 }));
  fjord.position.set((85 - cityCenter) * cellSize, 0.06, 0);
  group.add(fjord);
};

const addAcaciaTrees = (group: THREE.Group) => {
  for (let index = 0; index < 16; index += 1) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 1.35, 6), new THREE.MeshLambertMaterial({ color: 0x7c5a35 }));
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshLambertMaterial({ color: 0x6f8f3d }));
    crown.scale.y = 0.35;
    crown.position.y = 1.48;
    trunk.position.y = 0.66;
    tree.add(trunk, crown);
    tree.position.copy(tileToPosition((index * 19) % 78, 78 + (index % 6), 0));
    group.add(tree);
  }
};

const addVineRows = (group: THREE.Group) => {
  const material = new THREE.MeshLambertMaterial({ color: 0x6f8f43 });
  for (let row = 0; row < 6; row += 1) {
    const vine = new THREE.Mesh(new THREE.BoxGeometry(cellSize * 18, 0.18, 0.3), material);
    vine.position.copy(tileToPosition(12 + row * 2, 82 + row, 0.18));
    vine.rotation.y = 0.16;
    group.add(vine);
  }
};

const addLowHills = (group: THREE.Group) => {
  for (let index = 0; index < 6; index += 1) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(5 + index, 14, 8), new THREE.MeshLambertMaterial({ color: 0x9ab56d }));
    hill.scale.y = 0.24;
    hill.position.copy(tileToPosition(8 + index * 13, -7, 0.32));
    group.add(hill);
  }
};
