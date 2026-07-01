import { useEffect, useRef } from 'react';
import { playSound } from './soundSystem';
import type { CityStats } from './gameTypes';

export const useGameSounds = (stats: CityStats, enabled: boolean) => {
  const lastIncidentId = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const incidentId = stats.activeIncident?.id ?? null;
    if (incidentId && incidentId !== lastIncidentId.current) playSound('incident');
    lastIncidentId.current = incidentId;
  }, [enabled, stats.activeIncident?.id]);
};
