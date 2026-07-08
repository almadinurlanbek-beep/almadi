import type { Building, BuildingId, CityStats, Incident } from './gameTypes';
import { getCountry } from './countries';
import { defaultBuildingSkins } from './buildingSkins';

export const startingMoney = 1000000;
export const moneyGrantAmount = 1000000;
export const moneyGrantVersion = 1;
export const firstPayoutGraceSeconds = 600;
export const starterProtectionSeconds = 1800;

export const buildings: Building[] = [
  { id: 'shops', name: 'Магазин', icon: '🏪', cost: 10000, buildSeconds: 45, description: '+$120 в мин., строится 45 сек.' },
  { id: 'homes', name: 'Дома', icon: '🏠', cost: 3000, buildSeconds: 5, description: '+60 жителей, +$35 в мин., строится 5 сек.' },
  { id: 'schools', name: 'Школа', icon: '🏫', cost: 20000, buildSeconds: 30, description: '+$55 в мин., доверие и счастье, строится 30 сек.' },
  { id: 'hospitals', name: 'Больница', icon: '🏥', cost: 20000, buildSeconds: 45, description: '+$85 в мин., здоровье, строится 45 сек.' },
  { id: 'police', name: 'Полиция', icon: '🚓', cost: 15000, buildSeconds: 45, description: '+$45 в мин., безопасность, строится 45 сек.' },
  { id: 'fireStations', name: 'Пожарная', icon: '🚒', cost: 9000, buildSeconds: 45, description: '+$40 в мин., слабее пожары, строится 45 сек.' },
  { id: 'parks', name: 'Парк', icon: '🌳', cost: 20000, buildSeconds: 15, description: '+$25 в мин., счастье, строится 15 сек.' },
  { id: 'factories', name: 'Завод', icon: '🏭', cost: 50000, buildSeconds: 45, description: '+$300 в мин., -здоровье, строится 45 сек.' },
  { id: 'malls', name: 'ТЦ', icon: '🛍️', cost: 100000, buildSeconds: 60, description: '+$900 в мин., строится 1 мин.' },
  { id: 'airports', name: 'Аэропорт', icon: '✈️', cost: 150000, buildSeconds: 75, description: '+$2000 в мин., доверие, строится 1 мин. 15 сек.' },
  { id: 'stations', name: 'Вокзал', icon: '🚉', cost: 70000, buildSeconds: 45, description: '+$450 в мин., жители, строится 45 сек.' },
  { id: 'militaryBases', name: 'Военная база', icon: '🪖', cost: 500000, buildSeconds: 60, description: '+$650 в мин., безопасность, строится 1 мин.' },
];

export const emptyBuildings: Record<BuildingId, number> = {
  homes: 0,
  schools: 0,
  hospitals: 0,
  police: 0,
  fireStations: 0,
  parks: 0,
  factories: 0,
  shops: 0,
  malls: 0,
  airports: 0,
  stations: 0,
  militaryBases: 0,
  stadiums: 0,
  universities: 0,
  banks: 0,
  ports: 0,
  museums: 0,
};

export const initialCity: CityStats = {
  day: 1,
  minuteOfDay: 480,
  countryId: 'kazakhstan',
  countryPopulation: 20000000,
  money: startingMoney,
  population: 820,
  level: 1,
  xp: 0,
  taxRate: 12,
  moneyGrantVersion,
  residentPayoutSeconds: firstPayoutGraceSeconds,
  starterProtectionSeconds,
  happiness: 50,
  health: 70,
  safety: 50,
  trust: 50,
  buildings: emptyBuildings,
  buildingSkins: { ...defaultBuildingSkins },
  buildingPositions: {},
  construction: [],
  activeIncident: {
    id: 'test-chase',
    title: 'Погоня на городской дороге',
    source: 'полиция',
    report: 'Патруль заметил машину нарушителя. Она едет по дороге и не останавливается.',
    truth: 'Нужна полиция: нарушителя можно остановить, если быстро отправить экипаж.',
    severity: 3,
    remainingSeconds: 120,
    kind: 'chase',
  },
  incidentResponses: [],
  claimedQuestIds: [],
  hourlyQuests: [],
  nextHourlyQuestAt: null,
  news: ['Тест: на карте запущена погоня.'],
};

export const createInitialCity = (countryId: string): CityStats => ({
  ...initialCity,
  countryId,
  countryPopulation: getCountry(countryId).population,
  level: 1,
  xp: 0,
  buildings: { ...emptyBuildings },
  buildingSkins: { ...defaultBuildingSkins },
  buildingPositions: {},
  construction: [],
  activeIncident: null,
  incidentResponses: [],
  claimedQuestIds: [],
  hourlyQuests: [],
  nextHourlyQuestAt: null,
  news: [],
});

export const incidents: Omit<Incident, 'id' | 'severity' | 'remainingSeconds'>[] = [
  {
    title: 'Погоня на городской дороге',
    source: 'полиция',
    report: 'Патруль заметил машину нарушителя. Она едет по дороге и не останавливается.',
    truth: 'Нужна полиция: нарушителя можно остановить, если быстро отправить экипаж.',
    kind: 'chase',
  },
  {
    title: 'Пожар в жилом районе',
    source: 'звонок жителя',
    report: 'Очевидец говорит, что горит целый квартал. Данных мало.',
    truth: 'Горит один дом, но огонь может перейти дальше.',
    kind: 'fire',
  },
  {
    title: 'Подозрительная сумка на вокзале',
    source: 'камеры вокзала',
    report: 'На платформе вокзала заметили оставленную сумку. Нужно проверить угрозу.',
    truth: 'Сумка действительно подозрительная, район вокзала нужно быстро оцепить.',
    requiredBuilding: 'stations',
    kind: 'crime',
  },
  {
    title: 'Теракт в центре города',
    source: 'полиция',
    report: 'Поступили тревожные сообщения из центра. Масштаб угрозы уточняется.',
    truth: 'Угроза была настоящей, но часть слухов в сети оказалась ложной.',
    kind: 'terror',
  },
  {
    title: 'Вспышка болезни',
    source: 'СМИ',
    report: 'Новости пишут об эпидемии. Масштаб пока неизвестен.',
    truth: 'Заболели несколько районов, нужна быстрая медицина.',
    kind: 'epidemic',
  },
  {
    title: 'Сбой роботизированной сети',
    source: 'информатор',
    report: 'Роботы доставки останавливаются и блокируют дороги.',
    truth: 'Сбой настоящий, но его можно локализовать.',
    kind: 'robots',
  },
  {
    title: 'Городской протест',
    source: 'полиция',
    report: 'Люди требуют снизить налоги и решить проблему жилья.',
    truth: 'Протест мирный, но может стать массовым.',
    kind: 'protest',
  },
];
