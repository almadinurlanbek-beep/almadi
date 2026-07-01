import type { Incident } from './gameTypes';

const alerts: Record<Incident['kind'], string> = {
  chase: 'Полиция начала погоню за нарушителем!',
  fire: 'В городе пожар!',
  flood: 'Наводнение у набережной!',
  crime: 'Опасная ситуация у вокзала!',
  epidemic: 'В городе вспышка болезни!',
  robots: 'Массовый сбой роботов!',
  protest: 'Начались массовые протесты!',
  terror: 'Начался теракт в центре города!',
};

export const getAlertText = (incident: Incident) => alerts[incident.kind];
