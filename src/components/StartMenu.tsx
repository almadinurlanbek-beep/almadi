import { useState } from 'react';

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
        <h1>Твой город ждет</h1>
        <div className="start-account">
          <span>{isSignedIn ? `Аккаунт: ${userName ?? 'Google'}` : 'Войди через Google, чтобы сохранить свой город'}</span>
          {isSignedIn ? (
            <button type="button" className="start-link" onClick={onSignOut}>
              Выйти
            </button>
          ) : (
            <button type="button" className="start-link" disabled={authLoading} onClick={onGoogleSignIn}>
              {authLoading ? 'Загрузка...' : 'Войти через Google'}
            </button>
          )}
        </div>
        <div className="start-actions">
          <button type="button" className="start-button" disabled={!isSignedIn || authLoading} onClick={onStart}>
            Играть
          </button>
          <button type="button" className="start-button secondary" onClick={() => setShowHelp((current) => !current)}>
            Как играть?
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
