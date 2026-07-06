import { supabase } from './supabase';
import type { CityStats } from './gameTypes';

type AiResponse = {
  text?: unknown;
  error?: unknown;
};

export const requestMayorAdvice = async (stats: CityStats): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: {
        system: [
          'Ты советник мэра в игре про развитие города.',
          'Отвечай по-русски, дружелюбно и очень коротко.',
          'Дай 2-3 конкретных действия: что построить, поднять или исправить.',
          'Не используй markdown, списки и длинные объяснения.',
        ].join(' '),
        prompt: buildAdvicePrompt(stats),
      },
    });

    if (error) throw new Error(error.message);
    if (isAiResponse(data) && typeof data.error === 'string') throw new Error(cleanAiError(data.error));
    if (!isAiResponse(data) || typeof data.text !== 'string') throw new Error('ИИ не вернул совет.');

    const text = data.text.trim();
    if (!text) throw new Error('ИИ вернул пустой совет.');
    return text.slice(0, 420);
  } catch {
    return buildLocalAdvice(stats);
  }
};

const buildAdvicePrompt = (stats: CityStats) => {
  const activeIncident = stats.activeIncident ? stats.activeIncident.title : 'нет';

  return [
    `День: ${stats.day}`,
    `Деньги: ${stats.money}`,
    `Население: ${stats.population}`,
    `Счастье: ${stats.happiness}`,
    `Здоровье: ${stats.health}`,
    `Безопасность: ${stats.safety}`,
    `Доверие: ${stats.trust}`,
    `Налог: ${stats.taxRate}%`,
    `Дома: ${stats.buildings.homes}`,
    `Магазины: ${stats.buildings.shops}`,
    `Школы: ${stats.buildings.schools}`,
    `Больницы: ${stats.buildings.hospitals}`,
    `Полиция: ${stats.buildings.police}`,
    `Пожарные: ${stats.buildings.fireStations}`,
    `Парки: ${stats.buildings.parks}`,
    `Заводы: ${stats.buildings.factories}`,
    `Активное происшествие: ${activeIncident}`,
  ].join('\n');
};

const buildLocalAdvice = (stats: CityStats) => {
  const actions: string[] = [];

  if (stats.activeIncident) actions.push('Сначала закрой активное происшествие, иначе город будет терять показатели.');
  if (stats.health < 65) actions.push('Построй больницу или уменьши число заводов рядом с жилыми районами.');
  if (stats.safety < 65) actions.push('Добавь полицию или пожарную, чтобы поднять безопасность.');
  if (stats.happiness < 65) actions.push('Построй парк, школу или магазин для роста счастья.');
  if (stats.trust < 55) actions.push('Снизь налог на пару процентов и выполни ближайший квест.');
  if (stats.money < 30000) actions.push('Подожди доход или построй магазин, если хватает денег.');
  if (stats.buildings.homes < stats.buildings.shops + 2) actions.push('Добавь дома, чтобы городу хватало жителей.');

  const picked = actions.slice(0, 3);
  if (picked.length > 0) return picked.join(' ');
  return 'Город в норме: построй 1-2 магазина для дохода, затем добавь парк или школу, чтобы держать счастье высоким.';
};

const cleanAiError = (message: string) => {
  return message.replace(/^Error:\s*/i, '').trim();
};

const isAiResponse = (value: unknown): value is AiResponse => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};
