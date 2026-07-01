export type BuildingId =
  | 'homes'
  | 'schools'
  | 'hospitals'
  | 'police'
  | 'fireStations'
  | 'parks'
  | 'factories'
  | 'shops'
  | 'malls'
  | 'airports'
  | 'stations';

export type CityStats = {
  day: number;
  minuteOfDay: number;
  countryId: string;
  countryPopulation: number;
  money: number;
  population: number;
  taxRate: number;
  happiness: number;
  health: number;
  safety: number;
  trust: number;
  buildings: Record<BuildingId, number>;
  buildingPositions: Partial<Record<BuildingId, TilePoint[]>>;
  construction: ConstructionJob[];
  news: string[];
  activeIncident: Incident | null;
  incidentResponses: IncidentResponse[];
};

export type TilePoint = {
  x: number;
  y: number;
};

export type Building = {
  id: BuildingId;
  name: string;
  icon: string;
  cost: number;
  buildSeconds: number;
  description: string;
};

export type ConstructionJob = {
  id: string;
  buildingId: BuildingId;
  remainingSeconds: number;
  totalSeconds: number;
};

export type IncomeBreakdown = {
  label: string;
  amount: number;
};

export type Country = {
  id: string;
  name: string;
  population: number;
};

export type Incident = {
  id: string;
  title: string;
  source: string;
  report: string;
  truth: string;
  severity: number;
  requiredBuilding?: BuildingId;
  kind: 'fire' | 'flood' | 'crime' | 'chase' | 'epidemic' | 'robots' | 'protest' | 'terror';
};

export type IncidentResponse = {
  method: ResponseMethod;
  cost: number;
  people: number;
  remainingSeconds: number;
  purpose?: 'response' | 'investigation';
};

export type ResponseMethod =
  | 'police'
  | 'ambulance'
  | 'firefighters'
  | 'detectives'
  | 'epidemiologists'
  | 'engineers'
  | 'negotiators'
  | 'rescuers'
  | 'cameras'
  | 'ignore'
  | 'reward';

export type ResponseTeam = {
  method: ResponseMethod;
  name: string;
  cost: number;
  description: string;
  requiredBuilding?: BuildingId;
  missingText?: string;
};

export type ResolveOptions = {
  people: number;
};

export type ActionResult = {
  stats: CityStats;
  message: string;
};
