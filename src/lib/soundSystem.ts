import type { GameSettings } from './gameSettings';

type SoundName = 'start' | 'build' | 'click' | 'incident' | 'notify' | 'success' | 'warning';

export const startAudio = () => undefined;

export const playSound = (_name: SoundName) => undefined;

export const applyAudioSettings = (_settings: GameSettings) => undefined;
