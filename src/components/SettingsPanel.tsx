import {
  colorThemeOptions,
  wallpaperOptions,
  type ColorThemeId,
  type DeviceMode,
  type GameSettings,
  type WallpaperId,
} from '../lib/gameSettings';
import { useLanguage, type Language } from '../lib/i18n';

type Props = {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onClose: () => void;
};

export function SettingsPanel({ settings, onChange, onClose }: Props) {
  const { language } = useLanguage();
  const text = settingsText[language];
  const updateSettings = (change: Partial<GameSettings>) => {
    onChange({ ...settings, ...change });
  };

  return (
    <div className="settings-backdrop">
      <section className="settings-modal" aria-label={text.settings}>
        <div className="settings-head">
          <div>
            <p className="eyebrow">{text.game}</p>
            <h2>{text.settings}</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>{text.close}</button>
        </div>

        <div className="settings-field">
          <span>{text.device}</span>
          <div className="device-settings-grid">
            {deviceOptions.map((option) => (
              <button
                type="button"
                className={`device-setting ${settings.deviceMode === option ? 'active' : ''}`}
                key={option}
                onClick={() => updateSettings({ deviceMode: option })}
              >
                <span>{option === 'computer' ? '💻' : '📱'}</span>
                {deviceLabel[language][option]}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-field">
          <span>{text.themeColor}</span>
          <div className="theme-grid">
            {colorThemeOptions.map((option) => (
              <button
                type="button"
                className={`theme-choice ${settings.colorTheme === option.id ? 'active' : ''}`}
                key={option.id}
                onClick={() => updateSettings({ colorTheme: option.id as ColorThemeId })}
              >
                <span className={`theme-swatch ${option.id}`} />
                {themeLabel[language][option.id]}
              </button>
            ))}
          </div>
        </div>

        <label className="settings-field">
          <span>{text.youtubeMusic}</span>
          <input
            placeholder={text.youtubePlaceholder}
            type="url"
            value={settings.youtubeMusicUrl}
            onChange={(event) => updateSettings({ youtubeMusicUrl: event.target.value })}
          />
          <small>{text.youtubeHint}</small>
        </label>

        <div className="wallpaper-grid">
          {wallpaperOptions.map((option) => (
            <button
              type="button"
              className={`wallpaper-choice ${settings.wallpaper === option.id ? 'active' : ''}`}
              key={option.id}
              onClick={() => updateSettings({ wallpaper: option.id as WallpaperId })}
            >
              <span className={`wallpaper-swatch ${option.id}`} />
              {wallpaperLabel[language][option.id]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

const deviceOptions: Exclude<DeviceMode, 'unselected'>[] = ['computer', 'phone'];

const settingsText: Record<Language, {
  close: string;
  device: string;
  game: string;
  settings: string;
  themeColor: string;
  youtubeHint: string;
  youtubeMusic: string;
  youtubePlaceholder: string;
}> = {
  en: {
    close: 'Close',
    device: 'Device interface',
    game: 'Game',
    settings: 'Settings',
    themeColor: 'Theme color',
    youtubeHint: 'Use a normal video link. Some YouTube videos cannot be opened inside the game.',
    youtubeMusic: 'YouTube music',
    youtubePlaceholder: 'Paste a YouTube link',
  },
  ru: {
    close: 'Закрыть',
    device: 'Интерфейс устройства',
    game: 'Игра',
    settings: 'Настройки',
    themeColor: 'Цвет темы',
    youtubeHint: 'Лучше брать обычную ссылку на ролик. Некоторые видео YouTube запрещают открывать внутри игры.',
    youtubeMusic: 'YouTube музыка',
    youtubePlaceholder: 'Вставь ссылку на YouTube',
  },
  kk: {
    close: 'Жабу',
    device: 'Құрылғы интерфейсі',
    game: 'Ойын',
    settings: 'Баптаулар',
    themeColor: 'Тақырып түсі',
    youtubeHint: 'Кәдімгі видео сілтемесін қолданған дұрыс. Кейбір YouTube видеолары ойын ішінде ашылмайды.',
    youtubeMusic: 'YouTube музыкасы',
    youtubePlaceholder: 'YouTube сілтемесін қой',
  },
};

const deviceLabel: Record<Language, Record<Exclude<DeviceMode, 'unselected'>, string>> = {
  en: { computer: 'Computer', phone: 'Phone' },
  ru: { computer: 'Компьютер', phone: 'Телефон' },
  kk: { computer: 'Компьютер', phone: 'Телефон' },
};

const themeLabel: Record<Language, Record<ColorThemeId, string>> = {
  en: { emerald: 'Emerald', blue: 'Ocean', rose: 'Rose', gold: 'Gold', mint: 'Mint', aurora: 'Aurora', sunrise: 'Sunrise', berry: 'Berry', lagoon: 'Lagoon' },
  ru: { emerald: 'Изумруд', blue: 'Океан', rose: 'Роза', gold: 'Золото', mint: 'Мята', aurora: 'Аврора', sunrise: 'Рассвет', berry: 'Ягода', lagoon: 'Лагуна' },
  kk: { emerald: 'Изумруд', blue: 'Мұхит', rose: 'Раушан', gold: 'Алтын', mint: 'Жалбыз', aurora: 'Аврора', sunrise: 'Таң', berry: 'Жидек', lagoon: 'Лагуна' },
};

const wallpaperLabel: Record<Language, Record<WallpaperId, string>> = {
  en: { classic: 'Classic', sunset: 'Sunset', night: 'Night', park: 'Park', ocean: 'Ocean', desert: 'Desert', snow: 'Snow', space: 'Space', neon: 'Neon', mountains: 'Mountains', dawn: 'Dawn', rain: 'Rain' },
  ru: { classic: 'Классика', sunset: 'Закат', night: 'Ночь', park: 'Парк', ocean: 'Океан', desert: 'Пустыня', snow: 'Снег', space: 'Космос', neon: 'Неон', mountains: 'Горы', dawn: 'Рассвет', rain: 'Дождь' },
  kk: { classic: 'Классика', sunset: 'Күн батуы', night: 'Түн', park: 'Саябақ', ocean: 'Мұхит', desert: 'Шөл', snow: 'Қар', space: 'Ғарыш', neon: 'Неон', mountains: 'Таулар', dawn: 'Таң', rain: 'Жаңбыр' },
};
