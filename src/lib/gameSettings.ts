export type WallpaperId = 'classic' | 'sunset' | 'night' | 'park' | 'ocean' | 'desert' | 'snow' | 'space' | 'neon' | 'mountains' | 'dawn' | 'rain';
export type ColorThemeId = 'emerald' | 'blue' | 'rose' | 'gold' | 'mint' | 'aurora' | 'sunrise' | 'berry' | 'lagoon';
export type DeviceMode = 'unselected' | 'computer' | 'phone';

export type GameSettings = {
  colorTheme: ColorThemeId;
  deviceMode: DeviceMode;
  wallpaper: WallpaperId;
  youtubeMusicUrl: string;
};

export const wallpaperOptions: Array<{ id: WallpaperId; label: string }> = [
  { id: 'classic', label: 'Классика' },
  { id: 'sunset', label: 'Закат' },
  { id: 'night', label: 'Ночь' },
  { id: 'park', label: 'Парк' },
  { id: 'ocean', label: 'Океан' },
  { id: 'desert', label: 'Пустыня' },
  { id: 'snow', label: 'Снег' },
  { id: 'space', label: 'Космос' },
  { id: 'neon', label: 'Неон' },
  { id: 'mountains', label: 'Горы' },
  { id: 'dawn', label: 'Рассвет' },
  { id: 'rain', label: 'Дождь' },
];

export const colorThemeOptions: Array<{ id: ColorThemeId; label: string }> = [
  { id: 'emerald', label: 'Изумруд' },
  { id: 'blue', label: 'Океан' },
  { id: 'rose', label: 'Роза' },
  { id: 'gold', label: 'Золото' },
  { id: 'mint', label: 'Мята' },
  { id: 'aurora', label: 'Аврора' },
  { id: 'sunrise', label: 'Рассвет' },
  { id: 'berry', label: 'Ягода' },
  { id: 'lagoon', label: 'Лагуна' },
];

const storageKey = 'city-game-settings';

export const defaultGameSettings: GameSettings = {
  colorTheme: 'emerald',
  deviceMode: 'unselected',
  wallpaper: 'classic',
  youtubeMusicUrl: '',
};

export const loadGameSettings = (): GameSettings => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return defaultGameSettings;

  try {
    const parsed = JSON.parse(saved) as Partial<GameSettings>;
    return {
      colorTheme: isColorTheme(parsed.colorTheme) ? parsed.colorTheme : defaultGameSettings.colorTheme,
      deviceMode: isDeviceMode(parsed.deviceMode) ? parsed.deviceMode : defaultGameSettings.deviceMode,
      wallpaper: isWallpaper(parsed.wallpaper) ? parsed.wallpaper : defaultGameSettings.wallpaper,
      youtubeMusicUrl: typeof parsed.youtubeMusicUrl === 'string' ? parsed.youtubeMusicUrl : defaultGameSettings.youtubeMusicUrl,
    };
  } catch {
    return defaultGameSettings;
  }
};

export const saveGameSettings = (settings: GameSettings) => {
  localStorage.setItem(storageKey, JSON.stringify(settings));
};

const isWallpaper = (value: unknown): value is WallpaperId =>
  value === 'classic' || value === 'sunset' || value === 'night' || value === 'park' || value === 'ocean' ||
  value === 'desert' || value === 'snow' || value === 'space' || value === 'neon' || value === 'mountains' ||
  value === 'dawn' || value === 'rain';

const isColorTheme = (value: unknown): value is ColorThemeId =>
  value === 'emerald' || value === 'blue' || value === 'rose' || value === 'gold' || value === 'mint' ||
  value === 'aurora' || value === 'sunrise' || value === 'berry' || value === 'lagoon';

const isDeviceMode = (value: unknown): value is DeviceMode =>
  value === 'unselected' || value === 'computer' || value === 'phone';
