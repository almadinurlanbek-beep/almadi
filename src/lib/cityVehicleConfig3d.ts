import {
  createAmbulance,
  createCargoTruck,
  createCivilianCar,
  createCompactCar,
  createFireTruck,
  createPickupTruck,
  createPoliceCar,
  createVan,
} from './cityVehicleModels3d';

export type VehicleKind = 'police' | 'fire' | 'ambulance' | 'civilian' | 'pickup' | 'truck' | 'van' | 'compact';

export const getVehicleSpeed = (kind: VehicleKind) => {
  if (kind === 'fire') return 0.09;
  if (kind === 'ambulance') return 0.11;
  if (kind === 'truck') return 0.06;
  if (kind === 'van') return 0.07;
  if (kind === 'compact') return 0.09;
  if (kind === 'pickup') return 0.075;
  if (kind === 'civilian') return 0.08;
  return 0.12;
};

export const createVehicleMesh = (kind: VehicleKind, color: number) => {
  if (kind === 'fire') return createFireTruck();
  if (kind === 'ambulance') return createAmbulance();
  if (kind === 'police') return createPoliceCar();
  if (kind === 'pickup') return createPickupTruck(color);
  if (kind === 'truck') return createCargoTruck(color);
  if (kind === 'van') return createVan(color);
  if (kind === 'compact') return createCompactCar(color);
  return createCivilianCar(color);
};

export const getVehicleClearance = (kind: VehicleKind) => {
  if (kind === 'truck' || kind === 'fire') return 1.9;
  if (kind === 'van') return 1.7;
  if (kind === 'compact') return 1.15;
  if (kind === 'ambulance' || kind === 'pickup') return 1.55;
  return 1.35;
};
