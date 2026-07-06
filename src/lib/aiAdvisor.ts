import { supabase } from './supabase';
import type { CityStats } from './gameTypes';

type AiResponse = {
  text?: unknown;
  error?: unknown;
};

export const requestMayorAdvice = async (stats: CityStats): Promise<string> => {
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
  if (isAiResponse(data) && typeof data.error === 'string') throw new Error(data.error);
  if (!isAiResponse(data) || typeof data.text !== 'string') throw new Error('ИИ не вернул совет.');

  return data.text.trim().slice(0, 420);
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
    `Школы: ${stats.buildings.schools}`,
    `Больницы: ${stats.buildings.hospitals}`,
    `Полиция: ${stats.buildings.police}`,
    `Парки: ${stats.buildings.parks}`,
    `Активное происшествие: ${activeIncident}`,
  ].join('\n');
};

const isAiResponse = (value: unknown): value is AiResponse => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};
