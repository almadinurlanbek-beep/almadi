import type { Country } from './gameTypes';

export const countries: Country[] = [
  { id: 'kazakhstan', name: 'Казахстан', population: 20000000 },
  { id: 'uzbekistan', name: 'Узбекистан', population: 37000000 },
  { id: 'usa', name: 'США', population: 335000000 },
  { id: 'japan', name: 'Япония', population: 124000000 },
  { id: 'germany', name: 'Германия', population: 84000000 },
  { id: 'brazil', name: 'Бразилия', population: 203000000 },
  { id: 'india', name: 'Индия', population: 1428000000 },
];

export const getCountry = (id: string) => {
  return countries.find((country) => country.id === id) ?? countries[0];
};
