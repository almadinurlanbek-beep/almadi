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
  | 'stations'
  | 'militaryBases'
  | 'stadiums'
  | 'universities'
  | 'banks'
  | 'ports'
  | 'museums';

export type BuildingSkinId = 'classic' | 'modern' | 'gold';

export type HourlyQuestObjective = 'population' | 'happiness' | 'health' | 'safety' | 'trust' | 'homes' | 'schools' | 'parks' | 'shops';

export type HourlyQuest = {
  id: string;
  title: string;
  description: string;
  objective: HourlyQuestObjective;
  target: number;
  reward: number;
};

export type CityStats = {
  day: number;
  minuteOfDay: number;
  countryId: string;
  countryPopulation: number;
  money: number;
  moneyGrantVersion: number;
  population: number;
  level: number;
  xp: number;
  taxRate: number;
  residentPayoutSeconds: number;
  starterProtectionSeconds: number;
  happiness: number;
  health: number;
  safety: number;
  trust: number;
  buildings: Record<BuildingId, number>;
  buildingSkins: Record<BuildingId, BuildingSkinId>;
  buildingPositions: Partial<Record<BuildingId, TilePoint[]>>;
  construction: ConstructionJob[];
  news: string[];
  activeIncident: Incident | null;
  incidentResponses: IncidentResponse[];
  claimedQuestIds: string[];
  hourlyQuests: HourlyQuest[];
  nextHourlyQuestAt: number | null;
};

export type TilePoint = {
  x: number;
  y: number;
  rotation?: number;
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
  climate: CountryClimate;
  id: string;
  name: string;
  population: number;
  rulerTitle: string;
};

export type CountryClimate =
  | 'steppe-mountains'
  | 'taiga-snow'
  | 'desert-oasis'
  | 'temperate-forest'
  | 'tropical-forest'
  | 'islands'
  | 'savanna'
  | 'monsoon'
  | 'alpine'
  | 'mediterranean'
  | 'coastal-desert'
  | 'northern-fjords';

export type Incident = {
  id: string;
  title: string;
  source: string;
  report: string;
  truth: string;
  severity: number;
  remainingSeconds: number;
  tile?: TilePoint;
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
