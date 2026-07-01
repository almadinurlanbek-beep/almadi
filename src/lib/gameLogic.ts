import { createInitialCity, incidents } from './gameData';
import { advanceConstruction, startBuild } from './constructionLogic';
import { getMinuteIncome, getTaxIncome } from './economy';
import { advanceIncidentResponse, startIncidentResponse } from './incidentResponseLogic';
import { getAlertText } from './incidentAlerts';
import type { CityStats, Incident, ResponseMethod } from './gameTypes';

const DAY_MINUTES = 1440;
const INCIDENT_INTERVAL = 360;
const TEN_DAY_BONUS = 5000;
const RESIDENT_PAYOUT_INTERVAL = 10;
const RESIDENT_PAYOUT_RATE = 0.05;
const MAX_HAPPINESS = 92;
const MAX_SAFETY = 92;
const MAX_TRUST = 90;
const DEFEAT_HAPPINESS = 30;
const DEFEAT_SAFETY = 39;
const DEFEAT_TRUST = 39;

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const clampHappiness = (value: number) => Math.max(0, Math.min(MAX_HAPPINESS, Math.round(value)));
const clampSafety = (value: number) => Math.max(0, Math.min(MAX_SAFETY, Math.round(value)));
const clampTrust = (value: number) => Math.max(0, Math.min(MAX_TRUST, Math.round(value)));
const changeHappiness = (current: number, delta: number) => {
  const speed = delta > 0 ? 0.65 : 1.7;
  return clampHappiness(current + delta * speed);
};
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const randomJump = () => Math.floor(Math.random() * 3) - 1;

export const formatTime = (minuteOfDay: number) => {
  const hours = Math.floor(minuteOfDay / 60).toString().padStart(2, '0');
  const minutes = (minuteOfDay % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const withAlert = (stats: CityStats, item: string): CityStats => ({
  ...stats,
  news: [`День ${stats.day}, ${formatTime(stats.minuteOfDay)}: ${item}`, ...stats.news].slice(0, 7),
});

export const build = startBuild;

export const changeTax = (stats: CityStats, delta: number): CityStats => {
  const taxRate = Math.max(7, Math.min(28, stats.taxRate + delta));
  const pressure = taxRate - stats.taxRate;
  return resetIfDefeated({
    ...stats,
    taxRate,
    happiness: changeHappiness(stats.happiness, -pressure * 2),
    trust: clampTrust(stats.trust - pressure),
  });
};

export const advanceMinute = (stats: CityStats): CityStats => {
  const minuteOfDay = (stats.minuteOfDay + 1) % DAY_MINUTES;
  const minuteIncome = getMinuteIncome(stats);
  const base = applyMoodJumps(applyResidentPayout(updateCountryPopulation({ ...stats, minuteOfDay, money: stats.money + minuteIncome })));
  const afterDayChange = minuteOfDay === 0 ? startNewDay(base) : base;

  if (minuteOfDay > 0 && minuteOfDay % INCIDENT_INTERVAL === 0) {
    return triggerScheduledIncident(afterDayChange);
  }

  return afterDayChange;
};

const applyMoodJumps = (stats: CityStats): CityStats => ({
  ...stats,
  happiness: clampHappiness(stats.happiness + randomJump()),
  safety: clampSafety(stats.safety + randomJump()),
  trust: clampTrust(stats.trust + randomJump()),
});

const applyResidentPayout = (stats: CityStats): CityStats => {
  if (stats.minuteOfDay === 0 || stats.minuteOfDay % RESIDENT_PAYOUT_INTERVAL !== 0) return stats;
  const payout = Math.round(stats.money * RESIDENT_PAYOUT_RATE);
  if (payout <= 0) return stats;
  return {
    ...stats,
    money: Math.max(0, stats.money - payout),
    happiness: changeHappiness(stats.happiness, 1),
    trust: clampTrust(stats.trust + 1),
  };
};

const updateCountryPopulation = (stats: CityStats): CityStats => {
  if (stats.minuteOfDay % 30 !== 0) return stats;
  const direction = Math.random() > 0.48 ? 1 : -1;
  const percent = 0.00003 + Math.random() * 0.00012;
  const delta = Math.max(1, Math.round(stats.countryPopulation * percent)) * direction;
  return {
    ...stats,
    countryPopulation: Math.max(1000, stats.countryPopulation + delta),
  };
};

export const advanceTime = (stats: CityStats): CityStats => {
  if (stats.incidentResponses.length > 0) return resetIfDefeated(advanceConstruction(advanceIncidentResponse(stats)));

  const steps = stats.activeIncident ? 1 : 3;
  let next = stats;

  for (let step = 0; step < steps; step += 1) {
    next = advanceMinute(next);
    if (next.activeIncident) break;
  }

  return resetIfDefeated(advanceConstruction(next));
};

const startNewDay = (stats: CityStats): CityStats => {
  const income = getTaxIncome(stats);
  const nextDay = stats.day + 1;
  const bonus = nextDay % 10 === 0 ? TEN_DAY_BONUS : 0;
  const taxMood = stats.taxRate > 18 ? -3 : stats.taxRate < 9 ? 2 : 0;
  const services = stats.buildings.hospitals + stats.buildings.police + stats.buildings.parks;
  const emergencyTeams = stats.buildings.police + stats.buildings.fireStations;
  const safetyPressure = Math.floor(stats.population / 650);
  const safetyDelta = Math.round(emergencyTeams * 1.4 - safetyPressure);
  const crowded = stats.population > stats.buildings.homes * 230 ? -4 : 1;
  const next = {
    ...stats,
    day: nextDay,
    money: stats.money + income + bonus,
    population: Math.max(100, stats.population + Math.round((stats.happiness - 50) / 4)),
    happiness: changeHappiness(stats.happiness, taxMood + crowded + stats.buildings.parks),
    health: clamp(stats.health + stats.buildings.hospitals - stats.buildings.factories),
    safety: clampSafety(stats.safety + safetyDelta),
    trust: clampTrust(stats.trust + Math.round((services - 3) / 2) + taxMood),
  };
  return bonus > 0 ? withAlert(next, 'Город получил плановую выплату $5000.') : next;
};

const triggerScheduledIncident = (stats: CityStats): CityStats => {
  const event = createIncident(stats);
  const punished = stats.activeIncident ? punishUnresolvedIncident(stats) : stats;
  return withAlert({ ...punished, activeIncident: event, incidentResponses: [] }, getAlertText(event));
};

const punishUnresolvedIncident = (stats: CityStats): CityStats => ({
  ...stats,
  happiness: changeHappiness(stats.happiness, -3),
  safety: clampSafety(stats.safety - 4),
  trust: clampTrust(stats.trust - 5),
});

const createIncident = (stats: CityStats): Incident => {
  const availableIncidents = incidents.filter((incident) => (
    !incident.requiredBuilding || stats.buildings[incident.requiredBuilding] > 0
  ));
  const base = pick(availableIncidents);
  const severity = Math.max(1, Math.min(5, Math.round(Math.random() * 4 + (100 - stats.safety) / 35)));
  return { ...base, id: `${Date.now()}-${Math.random()}`, severity };
};

export const resolveIncident = (stats: CityStats, method: ResponseMethod, cost: number, people = 1): CityStats => {
  return resetIfDefeated(startIncidentResponse(stats, method, cost, people));
};

const resetIfDefeated = (stats: CityStats): CityStats => {
  if (
    stats.happiness >= DEFEAT_HAPPINESS
    && stats.safety >= DEFEAT_SAFETY
    && stats.trust >= DEFEAT_TRUST
  ) return stats;

  const reason = stats.safety < DEFEAT_SAFETY
    ? 'Безопасность упала ниже 39%. Город обнулился из-за хаоса на улицах.'
    : stats.trust < DEFEAT_TRUST
      ? 'Доверие упало ниже 39%. Город обнулился из-за потери поддержки жителей.'
      : 'Счастье упало ниже 30%. Город обнулился из-за недовольства жителей.';

  return {
    ...createInitialCity(stats.countryId),
    news: [`День ${stats.day}, ${formatTime(stats.minuteOfDay)}: ${reason}`],
  };
};


