import type { CityStats } from './gameTypes';
import type { Language } from './i18n';
import { supabase } from './supabase';

type AiResponse = {
  text?: unknown;
  error?: unknown;
};

export const requestMayorAdvice = async (stats: CityStats, language: Language): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: {
        system: advisorSystem[language],
        prompt: buildAdvicePrompt(stats, language),
      },
    });

    if (error) throw new Error(error.message);
    if (isAiResponse(data) && typeof data.error === 'string') throw new Error(cleanAiError(data.error));
    if (!isAiResponse(data) || typeof data.text !== 'string') throw new Error('AI did not return advice.');

    const text = data.text.trim();
    if (!text) throw new Error('AI returned empty advice.');
    return text.slice(0, 420);
  } catch {
    return buildLocalAdvice(stats, language);
  }
};

const buildAdvicePrompt = (stats: CityStats, language: Language) => {
  const labels = statLabels[language];
  const activeIncident = stats.activeIncident ? stats.activeIncident.title : labels.none;

  return [
    `${labels.day}: ${stats.day}`,
    `${labels.money}: ${stats.money}`,
    `${labels.population}: ${stats.population}`,
    `${labels.happiness}: ${stats.happiness}`,
    `${labels.health}: ${stats.health}`,
    `${labels.safety}: ${stats.safety}`,
    `${labels.trust}: ${stats.trust}`,
    `${labels.tax}: ${stats.taxRate}%`,
    `${labels.homes}: ${stats.buildings.homes}`,
    `${labels.shops}: ${stats.buildings.shops}`,
    `${labels.schools}: ${stats.buildings.schools}`,
    `${labels.hospitals}: ${stats.buildings.hospitals}`,
    `${labels.police}: ${stats.buildings.police}`,
    `${labels.fireStations}: ${stats.buildings.fireStations}`,
    `${labels.parks}: ${stats.buildings.parks}`,
    `${labels.factories}: ${stats.buildings.factories}`,
    `${labels.activeIncident}: ${activeIncident}`,
  ].join('\n');
};

const buildLocalAdvice = (stats: CityStats, language: Language) => {
  const text = localAdviceText[language];
  const actions: string[] = [];

  if (stats.activeIncident) actions.push(text.incident);
  if (stats.health < 65) actions.push(text.health);
  if (stats.safety < 65) actions.push(text.safety);
  if (stats.happiness < 65) actions.push(text.happiness);
  if (stats.trust < 55) actions.push(text.trust);
  if (stats.money < 30000) actions.push(text.money);
  if (stats.buildings.homes < stats.buildings.shops + 2) actions.push(text.homes);

  const picked = actions.slice(0, 3);
  return picked.length > 0 ? picked.join(' ') : text.stable;
};

const cleanAiError = (message: string) => {
  return message.replace(/^Error:\s*/i, '').trim();
};

const isAiResponse = (value: unknown): value is AiResponse => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const advisorSystem: Record<Language, string> = {
  en: 'You are a mayor advisor in a city-building game. Answer in English, friendly and very short. Give 2-3 concrete actions: what to build, raise or fix. Do not use markdown, lists or long explanations.',
  ru: 'Ты советник мэра в игре про развитие города. Отвечай по-русски, дружелюбно и очень коротко. Дай 2-3 конкретных действия: что построить, поднять или исправить. Не используй markdown, списки и длинные объяснения.',
  kk: 'Сен қала дамыту ойынындағы әкім кеңесшісісің. Қазақ тілінде жылы әрі өте қысқа жауап бер. 2-3 нақты әрекет ұсын: не салу, нені көтеру немесе түзету керек. Markdown, тізім және ұзақ түсіндіру қолданба.',
};

const statLabels: Record<Language, Record<string, string>> = {
  en: {
    activeIncident: 'Active incident',
    day: 'Day',
    factories: 'Factories',
    fireStations: 'Fire stations',
    happiness: 'Happiness',
    health: 'Health',
    homes: 'Homes',
    hospitals: 'Hospitals',
    money: 'Money',
    none: 'none',
    parks: 'Parks',
    police: 'Police',
    population: 'Population',
    safety: 'Safety',
    schools: 'Schools',
    shops: 'Shops',
    tax: 'Tax',
    trust: 'Trust',
  },
  ru: {
    activeIncident: 'Активное происшествие',
    day: 'День',
    factories: 'Заводы',
    fireStations: 'Пожарные',
    happiness: 'Счастье',
    health: 'Здоровье',
    homes: 'Дома',
    hospitals: 'Больницы',
    money: 'Деньги',
    none: 'нет',
    parks: 'Парки',
    police: 'Полиция',
    population: 'Население',
    safety: 'Безопасность',
    schools: 'Школы',
    shops: 'Магазины',
    tax: 'Налог',
    trust: 'Доверие',
  },
  kk: {
    activeIncident: 'Белсенді оқиға',
    day: 'Күн',
    factories: 'Зауыттар',
    fireStations: 'Өрт сөндіру бөлімдері',
    happiness: 'Бақыт',
    health: 'Денсаулық',
    homes: 'Үйлер',
    hospitals: 'Ауруханалар',
    money: 'Ақша',
    none: 'жоқ',
    parks: 'Саябақтар',
    police: 'Полиция',
    population: 'Халық',
    safety: 'Қауіпсіздік',
    schools: 'Мектептер',
    shops: 'Дүкендер',
    tax: 'Салық',
    trust: 'Сенім',
  },
};

const localAdviceText: Record<Language, Record<string, string>> = {
  en: {
    happiness: 'Build a park, school or shop to raise happiness.',
    health: 'Build a hospital or reduce factories near residential areas.',
    homes: 'Add homes so the city has enough residents.',
    incident: 'Resolve the active incident first, otherwise city stats will keep falling.',
    money: 'Wait for income or build a shop if you have enough money.',
    safety: 'Add police or a fire station to raise safety.',
    stable: 'The city is stable: build 1-2 shops for income, then add a park or school to keep happiness high.',
    trust: 'Lower taxes by a few percent and complete the nearest quest.',
  },
  ru: {
    happiness: 'Построй парк, школу или магазин для роста счастья.',
    health: 'Построй больницу или уменьши число заводов рядом с жилыми районами.',
    homes: 'Добавь дома, чтобы городу хватало жителей.',
    incident: 'Сначала закрой активное происшествие, иначе город будет терять показатели.',
    money: 'Подожди доход или построй магазин, если хватает денег.',
    safety: 'Добавь полицию или пожарную, чтобы поднять безопасность.',
    stable: 'Город в норме: построй 1-2 магазина для дохода, затем добавь парк или школу, чтобы держать счастье высоким.',
    trust: 'Снизь налог на пару процентов и выполни ближайший квест.',
  },
  kk: {
    happiness: 'Бақытты көтеру үшін саябақ, мектеп немесе дүкен сал.',
    health: 'Аурухана сал немесе тұрғын аудандар жанындағы зауыттарды азайт.',
    homes: 'Қалаға тұрғын жетуі үшін үйлер қос.',
    incident: 'Алдымен белсенді оқиғаны жап, әйтпесе қала көрсеткіштері төмендей береді.',
    money: 'Кірісті күт немесе ақша жетсе, дүкен сал.',
    safety: 'Қауіпсіздікті көтеру үшін полиция немесе өрт сөндіру бөлімін қос.',
    stable: 'Қала тұрақты: табыс үшін 1-2 дүкен сал, кейін бақытты ұстау үшін саябақ немесе мектеп қос.',
    trust: 'Салықты бірнеше пайызға түсіріп, ең жақын квестті орында.',
  },
};
