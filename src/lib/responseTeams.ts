import type { CityStats, Incident, ResponseMethod, ResponseTeam } from './gameTypes';

export const responseTeams: ResponseTeam[] = [
  { method: 'police', name: 'Полиция', cost: 6000, description: 'преступления, погони, теракты, протесты', requiredBuilding: 'police', missingText: 'Нет полицейского участка' },
  { method: 'ambulance', name: 'Скорая', cost: 8000, description: 'пострадавшие, болезни, теракты', requiredBuilding: 'hospitals', missingText: 'Нет больницы' },
  { method: 'firefighters', name: 'Пожарные', cost: 5000, description: 'пожары и аварии', requiredBuilding: 'fireStations', missingText: 'Нет пожарной станции' },
  { method: 'detectives', name: 'Детективы', cost: 280, description: 'поиск подозреваемых и проверка слухов', requiredBuilding: 'police', missingText: 'Нет полицейского участка' },
  { method: 'epidemiologists', name: 'Эпидемиологи', cost: 380, description: 'эпидемии и массовые болезни', requiredBuilding: 'hospitals', missingText: 'Нет больницы' },
  { method: 'engineers', name: 'Инженеры', cost: 360, description: 'роботы, инфраструктура, сбои' },
  { method: 'negotiators', name: 'Переговорщики', cost: 220, description: 'протесты и паника жителей' },
  { method: 'rescuers', name: 'Спасатели', cost: 300, description: 'пожары и эвакуация', requiredBuilding: 'fireStations', missingText: 'Нет пожарной станции' },
];

export const getMissingTeamReason = (stats: CityStats, team: ResponseTeam) => {
  if (!team.requiredBuilding) return null;
  return stats.buildings[team.requiredBuilding] > 0 ? null : team.missingText ?? 'Нет нужной службы';
};

export const getResponseBonus = (stats: CityStats, incident: Incident, method: ResponseMethod, cost: number, people: number) => {
  if (method === 'ignore') return 0;
  if (method === 'reward') return Math.floor(cost / 120);
  if (method === 'cameras') return incident.kind === 'crime' || incident.kind === 'chase' || incident.kind === 'terror' ? 2 : 1;
  const peopleBonus = Math.min(6, Math.max(0, people - 1));
  if (method === 'police') return getServiceBonus(stats.buildings.police, incident, ['crime', 'chase', 'terror', 'protest']) + peopleBonus;
  if (method === 'ambulance') return getServiceBonus(stats.buildings.hospitals, incident, ['epidemic', 'fire', 'terror']) + peopleBonus;
  if (method === 'firefighters') return getServiceBonus(stats.buildings.fireStations, incident, ['fire', 'robots']) + peopleBonus;
  if (method === 'detectives') return (includesKind(incident, ['crime', 'chase', 'terror']) ? 4 : 1) + peopleBonus;
  if (method === 'epidemiologists') return (incident.kind === 'epidemic' ? 5 : 1) + peopleBonus;
  if (method === 'engineers') return (incident.kind === 'robots' ? 4 : 1) + peopleBonus;
  if (method === 'negotiators') return (incident.kind === 'protest' || incident.kind === 'terror' ? 4 : 1) + peopleBonus;
  return (includesKind(incident, ['fire', 'terror']) ? 4 : 1) + peopleBonus;
};

const getServiceBonus = (count: number, incident: Incident, strongKinds: Incident['kind'][]) => {
  const base = includesKind(incident, strongKinds) ? 3 : 1;
  return base + Math.min(2, count);
};

const includesKind = (incident: Incident, kinds: Incident['kind'][]) => {
  return kinds.includes(incident.kind);
};
