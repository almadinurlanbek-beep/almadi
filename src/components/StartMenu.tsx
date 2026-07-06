import { useState } from 'react';
import { languageOptions, useLanguage } from '../lib/i18n';

type Props = {
  authLoading: boolean;
  isSignedIn: boolean;
  leaving: boolean;
  userName: string | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onStart: () => void;
};

export function StartMenu({ authLoading, isSignedIn, leaving, userName, onGoogleSignIn, onSignOut, onStart }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);

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
          <select value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
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
        <div className="start-actions">
          <button type="button" className="start-button" disabled={!isSignedIn || authLoading} onClick={onStart}>
            {t('play')}
          </button>
          <button type="button" className="start-button secondary" onClick={() => setShowHelp((current) => !current)}>
            {t('howToPlay')}
          </button>
        </div>
        {showHelp && (
          <div className="start-help">
                <p>Строй дома, службы и транспорт, чтобы город рос и зарабатывал деньги.</p>
                <p>Следи за счастьем, здоровьем, безопасностью и доверием жителей.</p>
                <p>Когда появляется происшествие, проверь информацию или отправь нужную службу.</p>
                <p>У каждой страны свой город: постройки сохраняются только в этой стране.</p>
          </div>
        )}
      </div>
    </section>
  );
}
