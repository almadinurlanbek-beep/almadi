import type { BuildingId, CityStats, IncomeBreakdown } from './gameTypes';

const buildingMinuteIncome: Record<BuildingId, number> = {
  homes: 35,
  schools: 55,
  hospitals: 85,
  police: 45,
  fireStations: 40,
  parks: 25,
  factories: 300,
  shops: 120,
  malls: 900,
  airports: 2000,
  stations: 450,
  militaryBases: 650,
  stadiums: 1800,
  universities: 1200,
  banks: 1600,
  ports: 2200,
  museums: 900,
};

const buildingIncomeLabels: Record<BuildingId, string> = {
  homes: 'Дома / мин',
  schools: 'Школы / мин',
  hospitals: 'Больницы / мин',
  police: 'Полиция / мин',
  fireStations: 'Пожарные / мин',
  parks: 'Парки / мин',
  factories: 'Заводы / мин',
  shops: 'Магазины / мин',
  malls: 'ТЦ / мин',
  airports: 'Аэропорты / мин',
  stations: 'Вокзалы / мин',
  militaryBases: 'Военные базы / мин',
  stadiums: 'Стадионы / мин',
  universities: 'Университеты / мин',
  banks: 'Банки / мин',
  ports: 'Порты / мин',
  museums: 'Музеи / мин',
};

export const getIncomeBreakdown = (stats: CityStats): IncomeBreakdown[] => {
  const taxPenalty = stats.happiness < 60 ? 0.8 : 1;
  const taxes = Math.round(stats.population * stats.taxRate * 0.15 * taxPenalty);
  const taxLabel = stats.happiness < 60 ? 'Налоги жителей (-20%)' : 'Налоги жителей';
  const buildingsIncome = [
    ['Больницы', stats.buildings.hospitals * 85],
    ['Школы', stats.buildings.schools * 55],
    ['Полиция', stats.buildings.police * 35],
    ['Пожарные', stats.buildings.fireStations * 30],
    ['Парки', stats.buildings.parks * 25],
    ['Аэропорты', stats.buildings.airports * 750],
    ['Вокзалы', stats.buildings.stations * 320],
  ];

  return [
    { label: taxLabel, amount: taxes },
    ...buildingsIncome.map(([label, amount]) => ({ label: String(label), amount: Number(amount) })),
  ];
};

export const getTaxIncome = (stats: CityStats) => {
  return getIncomeBreakdown(stats).reduce((total, item) => total + item.amount, 0);
};

export const getMinuteIncomeBreakdown = (stats: CityStats): IncomeBreakdown[] => {
  return Object.entries(buildingMinuteIncome)
    .map(([id, income]) => {
      const buildingId = id as BuildingId;
      return {
        label: buildingIncomeLabels[buildingId],
        amount: stats.buildings[buildingId] * income,
      };
    })
    .filter((item) => item.amount > 0);
};

export const getMinuteIncome = (stats: CityStats) => {
  return getMinuteIncomeBreakdown(stats).reduce((total, item) => total + item.amount, 0);
};
