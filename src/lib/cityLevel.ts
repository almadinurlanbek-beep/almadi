import type { BuildingId, CityStats } from './gameTypes';

const levelBonus = 10000;
const xpByBuilding: Record<BuildingId, number> = {
  homes: 45,
  shops: 70,
  parks: 80,
  schools: 120,
  hospitals: 130,
  police: 120,
  fireStations: 100,
  factories: 180,
  stations: 220,
  malls: 280,
  airports: 420,
  militaryBases: 260,
  stadiums: 500,
  universities: 460,
  banks: 360,
  ports: 520,
  museums: 430,
};

export const getXpForBuilding = (buildingId: BuildingId) => xpByBuilding[buildingId];

export const getXpForNextLevel = (level: number) => 160 + level * 70;

export const addCityXp = (stats: CityStats, amount: number) => {
  let level = stats.level ?? 1;
  let xp = (stats.xp ?? 0) + amount;
  let money = stats.money;
  const rewards: number[] = [];

  while (xp >= getXpForNextLevel(level)) {
    xp -= getXpForNextLevel(level);
    level += 1;
    if (level % 5 === 0) {
      money += levelBonus;
      rewards.push(level);
    }
  }

  return {
    stats: { ...stats, level, xp, money },
    rewards,
  };
};
