import type { CityStats, IncomeBreakdown } from './gameTypes';

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

export const getMinuteIncomeBreakdown = (stats: CityStats): IncomeBreakdown[] => [
  { label: 'Заводы / мин', amount: stats.buildings.factories * 300 },
  { label: 'ТЦ / мин', amount: stats.buildings.malls * 900 },
  { label: 'Аэропорты / мин', amount: stats.buildings.airports * 2000 },
  { label: 'Вокзалы / мин', amount: stats.buildings.stations * 450 },
];

export const getMinuteIncome = (stats: CityStats) => {
  return getMinuteIncomeBreakdown(stats).reduce((total, item) => total + item.amount, 0);
};
