export const policeRoutes: [number, number][][] = [
  [[2, 4], [32, 4], [32, 24], [2, 24]],
  [[12, 14], [62, 14], [62, 44], [12, 44]],
  [[42, 4], [72, 4], [72, 34], [42, 34]],
  [[2, 54], [32, 54], [32, 74], [2, 74]],
  [[42, 44], [72, 44], [72, 74], [42, 74]],
  [[12, 34], [72, 34], [72, 54], [12, 54]],
];

export const firePatrolRoutes: [number, number][][] = [
  [[2, 54], [52, 54], [52, 74], [2, 74]],
  [[2, 34], [32, 34], [32, 64], [2, 64]],
  [[32, 24], [72, 24], [72, 54], [32, 54]],
  [[22, 4], [62, 4], [62, 34], [22, 34]],
  [[52, 54], [72, 54], [72, 74], [52, 74]],
];

export const trafficRoutes: [number, number][][] = [
  [[2, 4], [72, 4], [72, 24], [2, 24]],
  [[12, 14], [62, 14], [62, 44], [12, 44]],
  [[22, 4], [22, 74], [52, 74], [52, 4]],
  [[2, 54], [72, 54], [72, 74], [2, 74]],
  [[42, 4], [42, 64], [72, 64], [72, 4]],
  [[2, 34], [62, 34], [62, 14], [2, 14]],
  [[32, 4], [32, 74], [12, 74], [12, 4]],
  [[52, 24], [72, 24], [72, 54], [52, 54]],
];

export const trafficColors = [0x4f79b8, 0xc75a4a, 0xe0b84f, 0x5a9b72, 0x8f6bb3, 0xd6d8d9];
export const roadLaneOffset = 0.56;

export type TrafficPlan = {
  kind: 'civilian' | 'pickup' | 'truck' | 'van' | 'compact';
  routeIndex: number;
  color: number;
  offset: number;
  laneOffset: number;
};

export const trafficPlans: TrafficPlan[] = [
  { kind: 'civilian', routeIndex: 0, color: 0x4f79b8, offset: 0, laneOffset: -roadLaneOffset },
  { kind: 'pickup', routeIndex: 1, color: 0x5a9b72, offset: 8, laneOffset: roadLaneOffset },
  { kind: 'truck', routeIndex: 2, color: 0xd8a43f, offset: 16, laneOffset: -roadLaneOffset },
  { kind: 'civilian', routeIndex: 3, color: 0xc75a4a, offset: 24, laneOffset: roadLaneOffset },
  { kind: 'pickup', routeIndex: 4, color: 0x8f6bb3, offset: 32, laneOffset: -roadLaneOffset },
  { kind: 'truck', routeIndex: 5, color: 0x6e7f8f, offset: 40, laneOffset: roadLaneOffset },
  { kind: 'civilian', routeIndex: 6, color: 0xe0b84f, offset: 48, laneOffset: -roadLaneOffset },
  { kind: 'pickup', routeIndex: 7, color: 0x2f9e91, offset: 56, laneOffset: roadLaneOffset },
  { kind: 'compact', routeIndex: 0, color: 0xf2f0e6, offset: 34, laneOffset: roadLaneOffset },
  { kind: 'van', routeIndex: 1, color: 0x7f8d99, offset: 44, laneOffset: -roadLaneOffset },
  { kind: 'civilian', routeIndex: 2, color: 0x28384f, offset: 60, laneOffset: roadLaneOffset },
  { kind: 'compact', routeIndex: 3, color: 0xb84f6a, offset: 70, laneOffset: -roadLaneOffset },
  { kind: 'van', routeIndex: 4, color: 0xd6d8d9, offset: 82, laneOffset: roadLaneOffset },
  { kind: 'civilian', routeIndex: 5, color: 0x3b6f9f, offset: 92, laneOffset: -roadLaneOffset },
  { kind: 'compact', routeIndex: 6, color: 0x6c7a3f, offset: 102, laneOffset: roadLaneOffset },
  { kind: 'truck', routeIndex: 7, color: 0xb07d45, offset: 114, laneOffset: -roadLaneOffset },
];
