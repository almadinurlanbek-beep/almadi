import { getMissingTeamReason, getResponseBonus, responseTeams } from './responseTeams';
import type { CityStats, ResponseMethod } from './gameTypes';

const RESPONSE_SECONDS = 60;
const INVESTIGATION_SECONDS = 30;
const MAX_HAPPINESS = 92;
const MAX_SAFETY = 92;
const MAX_TRUST = 90;

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const clampHappiness = (value: number) => Math.max(0, Math.min(MAX_HAPPINESS, Math.round(value)));
const clampSafety = (value: number) => Math.max(0, Math.min(MAX_SAFETY, Math.round(value)));
const clampTrust = (value: number) => Math.max(0, Math.min(MAX_TRUST, Math.round(value)));
const changeHappiness = (current: number, delta: number) => clampHappiness(current + delta * (delta > 0 ? 0.65 : 1.7));

export const startIncidentResponse = (stats: CityStats, method: ResponseMethod, cost: number, people = 1): CityStats => {
  if (!stats.activeIncident || stats.money < cost) return stats;
  if (stats.incidentResponses.some((response) => response.method === method)) return stats;
  const team = responseTeams.find((item) => item.method === method);
  if (team && getMissingTeamReason(stats, team)) return stats;
  if (method === 'ignore') return finishIncident(stats, method, cost, people);
  const investigation = isInvestigationMethod(method);
  const response = {
    method,
    cost,
    people,
    remainingSeconds: investigation ? INVESTIGATION_SECONDS : RESPONSE_SECONDS,
    purpose: investigation ? 'investigation' as const : 'response' as const,
  };
  return withAlert(
    { ...stats, money: stats.money - cost, incidentResponses: [...stats.incidentResponses, response] },
    getStartText(stats, method),
  );
};

export const advanceIncidentResponse = (stats: CityStats): CityStats => {
  if (stats.incidentResponses.length === 0) return stats;
  const responses = stats.incidentResponses.map((response) => ({ ...response, remainingSeconds: response.remainingSeconds - 1 }));
  const active = responses.filter((response) => response.remainingSeconds > 0);
  const finished = responses.filter((response) => response.remainingSeconds <= 0);
  const finishedInvestigations = finished.filter(isInvestigationResponse);
  const finishedResponses = finished.filter((response) => !isInvestigationResponse(response));

  if (finishedResponses.length > 0) {
    return withAlert(finishIncidentWithResponses({ ...stats, incidentResponses: active }, finishedResponses), 'Происшествие устранено.');
  }
  if (finishedInvestigations.length > 0) {
    return withAlert({ ...stats, incidentResponses: active }, getInvestigationResult(stats));
  }
  return { ...stats, incidentResponses: active };
};

const finishIncident = (stats: CityStats, method: ResponseMethod, cost: number, people: number, bonusCost = cost): CityStats => {
  if (!stats.activeIncident || stats.money < cost) return stats;
  const incident = stats.activeIncident;
  const bonus = getResponseBonus(stats, incident, method, bonusCost, people);
  const damage = Math.max(0, incident.severity - bonus);
  const moneyAfterCost = stats.money - cost;
  const moneyPenalty = method === 'ignore' ? Math.round(moneyAfterCost * 0.3) : 0;
  return {
    ...stats,
    money: Math.max(0, moneyAfterCost - moneyPenalty),
    activeIncident: null,
    incidentResponses: [],
    safety: clampSafety(stats.safety - damage * 2 + (method === 'police' ? 4 : 0)),
    happiness: changeHappiness(stats.happiness, -damage + (method === 'negotiators' ? 4 : 0)),
    health: clamp(stats.health - (incident.kind === 'epidemic' || incident.kind === 'flood' ? damage * 2 : damage)),
    trust: clampTrust(stats.trust + (method === 'ignore' ? -9 : 3 + bonus)),
  };
};

const finishIncidentWithResponses = (stats: CityStats, responses: CityStats['incidentResponses']): CityStats => {
  if (!stats.activeIncident) return stats;
  const bonus = responses.reduce((total, response) => total + getResponseBonus(stats, stats.activeIncident!, response.method, response.cost, response.people), 0);
  const incident = stats.activeIncident;
  const damage = Math.max(0, incident.severity - bonus);
  return {
    ...stats,
    activeIncident: null,
    incidentResponses: [],
    safety: clampSafety(stats.safety - damage * 2 + (responses.some((item) => item.method === 'police') ? 4 : 0)),
    happiness: changeHappiness(stats.happiness, -damage + (responses.some((item) => item.method === 'negotiators') ? 4 : 0)),
    health: clamp(stats.health - (incident.kind === 'epidemic' || incident.kind === 'flood' ? damage * 2 : damage)),
    trust: clampTrust(stats.trust + 3 + bonus),
  };
};

const getStartText = (stats: CityStats, method: ResponseMethod) => {
  if (method === 'reward') return `Награда за информацию объявлена. Проверяем, что происходит: ${stats.activeIncident?.report ?? ''}`;
  if (method === 'cameras') return 'Поиск информации начат: камеры и свидетели проверяют ситуацию.';
  return `${getResponseName(method)} выехали к месту происшествия.`;
};

const getInvestigationResult = (stats: CityStats) => {
  return stats.activeIncident ? `Расследование завершено. Правда: ${stats.activeIncident.truth}` : 'Расследование завершено.';
};

const getResponseName = (method: ResponseMethod) => {
  return responseTeams.find((team) => team.method === method)?.name ?? 'Службы';
};

const isInvestigationMethod = (method: ResponseMethod) => method === 'cameras' || method === 'reward';

const isInvestigationResponse = (response: CityStats['incidentResponses'][number]) => {
  return response.purpose === 'investigation' || isInvestigationMethod(response.method);
};

const withAlert = (stats: CityStats, item: string): CityStats => ({
  ...stats,
  news: [`День ${stats.day}, ${formatTime(stats.minuteOfDay)}: ${item}`, ...stats.news].slice(0, 7),
});

const formatTime = (minuteOfDay: number) => {
  const hours = Math.floor(minuteOfDay / 60).toString().padStart(2, '0');
  const minutes = (minuteOfDay % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
