import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { playSound } from './soundSystem';
import type { CityStats } from './gameTypes';

export type EventNotification = {
  id: string;
  kind: 'info' | 'success' | 'warning';
  text: string;
};

export const useEventNotifications = (stats: CityStats, enabled: boolean) => {
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const initialized = useRef(false);
  const lastIncidentId = useRef<string | null>(null);
  const lastNews = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      initialized.current = false;
      lastIncidentId.current = stats.activeIncident?.id ?? null;
      lastNews.current = stats.news[0] ?? null;
      return;
    }

    const incidentId = stats.activeIncident?.id ?? null;
    const latestNews = stats.news[0] ?? null;

    if (!initialized.current) {
      initialized.current = true;
      lastIncidentId.current = incidentId;
      lastNews.current = latestNews;
      return;
    }

    if (stats.activeIncident && incidentId !== lastIncidentId.current) {
      lastIncidentId.current = incidentId;
      lastNews.current = latestNews;
      pushNotification(setNotifications, {
        kind: 'warning',
        text: stats.activeIncident.title,
      });
      playSound('incident');
      return;
    }

    lastIncidentId.current = incidentId;

    if (latestNews && latestNews !== lastNews.current) {
      lastNews.current = latestNews;
      const kind = getNotificationKind(latestNews);
      pushNotification(setNotifications, { kind, text: latestNews });
      playSound(kind === 'success' ? 'success' : kind === 'warning' ? 'warning' : 'notify');
    }
  }, [enabled, stats.activeIncident?.id, stats.news]);

  const dismissNotification = (id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  return { dismissNotification, notifications };
};

const pushNotification = (
  setNotifications: Dispatch<SetStateAction<EventNotification[]>>,
  notification: Omit<EventNotification, 'id'>,
) => {
  const id = `${Date.now()}-${Math.random()}`;
  setNotifications((current) => [{ id, ...notification }, ...current].slice(0, 3));
  window.setTimeout(() => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, 5500);
};

const getNotificationKind = (text: string): EventNotification['kind'] => {
  const lower = text.toLowerCase();
  if (lower.includes('награда') || lower.includes('заверш') || lower.includes('получил')) return 'success';
  if (lower.includes('происшествие') || lower.includes('упала') || lower.includes('обнулился')) return 'warning';
  return 'info';
};
