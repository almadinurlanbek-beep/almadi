import type { Country } from './gameTypes';

export const countries: Country[] = [
  { id: 'kazakhstan', name: 'Казахстан', population: 20000000, rulerTitle: 'Аким', climate: 'steppe-mountains' },
  { id: 'russia', name: 'Россия', population: 146000000, rulerTitle: 'Царь', climate: 'taiga-snow' },
  { id: 'uzbekistan', name: 'Узбекистан', population: 37000000, rulerTitle: 'Хоким', climate: 'desert-oasis' },
  { id: 'usa', name: 'США', population: 335000000, rulerTitle: 'Президент', climate: 'temperate-forest' },
  { id: 'japan', name: 'Япония', population: 124000000, rulerTitle: 'Император', climate: 'islands' },
  { id: 'germany', name: 'Германия', population: 84000000, rulerTitle: 'Канцлер', climate: 'temperate-forest' },
  { id: 'brazil', name: 'Бразилия', population: 203000000, rulerTitle: 'Президент', climate: 'tropical-forest' },
  { id: 'india', name: 'Индия', population: 1428000000, rulerTitle: 'Премьер-министр', climate: 'monsoon' },
  { id: 'canada', name: 'Канада', population: 40000000, rulerTitle: 'Премьер-министр', climate: 'taiga-snow' },
  { id: 'egypt', name: 'Египет', population: 112000000, rulerTitle: 'Президент', climate: 'desert-oasis' },
  { id: 'norway', name: 'Норвегия', population: 5500000, rulerTitle: 'Король', climate: 'northern-fjords' },
  { id: 'australia', name: 'Австралия', population: 27000000, rulerTitle: 'Премьер-министр', climate: 'savanna' },
  { id: 'china', name: 'Китай', population: 1410000000, rulerTitle: 'Председатель', climate: 'alpine' },
  { id: 'france', name: 'Франция', population: 68000000, rulerTitle: 'Президент', climate: 'mediterranean' },
  { id: 'uae', name: 'ОАЭ', population: 10000000, rulerTitle: 'Шейх', climate: 'coastal-desert' },
];

export const getCountry = (id: string) => {
  return countries.find((country) => country.id === id) ?? countries[0];
};
