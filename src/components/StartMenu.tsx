import { useState } from 'react';
import type { DeviceMode } from '../lib/gameSettings';
import { languageOptions, useLanguage, type Language } from '../lib/i18n';
import { GameMechanicsModal } from './GameMechanicsModal';

type Props = {
  authLoading: boolean;
  deviceMode: DeviceMode;
  isSignedIn: boolean;
  leaving: boolean;
  userName: string | null;
  onDeviceModeChange: (deviceMode: DeviceMode) => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onStart: () => void;
};

export function StartMenu({ authLoading, deviceMode, isSignedIn, leaving, userName, onDeviceModeChange, onGoogleSignIn, onSignOut, onStart }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const [isMechanicsOpen, setIsMechanicsOpen] = useState(false);
  const text = startMenuText[language];
  const hasDevice = deviceMode !== 'unselected';

  return (
    <section className={`start-menu ${leaving ? 'leaving' : ''}`}>
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="cloud cloud-c" />
      <div className="start-room" aria-hidden="true">
        <div className="room-window">
          <span />
          <span />
          <span />
        </div>
        <div className="room-board">
          <span />
          <span />
          <span />
        </div>
        <div className="room-desk">
          <span className="desk-map" />
          <span className="desk-lamp" />
        </div>
        <div className="room-chair" />
      </div>
      <div className="start-content">
        <p className="eyebrow">City Mayor Simulator</p>
        <h1>{t('startTitle')}</h1>
        <label className="language-select">
          <span>{t('language')}</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
            {languageOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <div className="start-account">
          <span>{isSignedIn ? `${t('account')}: ${userName ?? 'Google'}` : t('signInPrompt')}</span>
          {isSignedIn ? (
            <button type="button" className="start-link" onClick={onSignOut}>
              {t('signOut')}
            </button>
          ) : (
            <button type="button" className="start-link" disabled={authLoading} onClick={onGoogleSignIn}>
              {authLoading ? t('loading') : t('signInGoogle')}
            </button>
          )}
        </div>
        <div className="device-picker">
          <div>
            <p className="eyebrow">{text.deviceEyebrow}</p>
            <h2>{text.deviceTitle}</h2>
          </div>
          <div className="device-options">
            <button type="button" className={`device-option ${deviceMode === 'computer' ? 'active' : ''}`} onClick={() => onDeviceModeChange('computer')}>
              <span>💻</span>
              <strong>{text.computer}</strong>
              <small>{text.computerHint}</small>
            </button>
            <button type="button" className={`device-option ${deviceMode === 'phone' ? 'active' : ''}`} onClick={() => onDeviceModeChange('phone')}>
              <span>📱</span>
              <strong>{text.phone}</strong>
              <small>{text.phoneHint}</small>
            </button>
          </div>
        </div>
        <div className="start-actions">
          <button type="button" className="start-button" disabled={!isSignedIn || authLoading || !hasDevice} onClick={onStart}>
            {hasDevice ? t('play') : text.chooseDevice}
          </button>
          <button type="button" className="start-button secondary" onClick={() => setIsMechanicsOpen(true)}>
            {text.mechanics}
          </button>
        </div>
      </div>
      {isMechanicsOpen && <GameMechanicsModal onClose={() => setIsMechanicsOpen(false)} />}
    </section>
  );
}

const startMenuText: Record<Language, {
  chooseDevice: string;
  computer: string;
  computerHint: string;
  deviceEyebrow: string;
  deviceTitle: string;
  mechanics: string;
  phone: string;
  phoneHint: string;
}> = {
  en: {
    chooseDevice: 'Choose device',
    computer: 'Computer',
    computerHint: 'Wide map, full panels, mouse-friendly controls.',
    deviceEyebrow: 'Interface',
    deviceTitle: 'Choose your device',
    mechanics: 'Game mechanics',
    phone: 'Phone',
    phoneHint: 'Compact panels, bottom navigation, touch-friendly layout.',
  },
  ru: {
    chooseDevice: 'Выбери устройство',
    computer: 'Компьютер',
    computerHint: 'Широкая карта, полные панели, удобно мышкой.',
    deviceEyebrow: 'Интерфейс',
    deviceTitle: 'Выбери своё устройство',
    mechanics: 'Механика игры',
    phone: 'Телефон',
    phoneHint: 'Компактные панели, нижнее меню, удобно пальцем.',
  },
  kk: {
    chooseDevice: 'Құрылғыны таңда',
    computer: 'Компьютер',
    computerHint: 'Кең карта, толық панельдер, тышқанмен ыңғайлы.',
    deviceEyebrow: 'Интерфейс',
    deviceTitle: 'Құрылғыңды таңда',
    mechanics: 'Ойын механикасы',
    phone: 'Телефон',
    phoneHint: 'Ықшам панельдер, төменгі мәзір, саусақпен ыңғайлы.',
  },
};
