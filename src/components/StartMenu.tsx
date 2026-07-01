import { useCallback, useState } from 'react';
import { StartAuthForm } from './StartAuthForm';

type Props = {
  leaving: boolean;
  onStart: () => void;
};

export function StartMenu({ leaving, onStart }: Props) {
  const [authReady, setAuthReady] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const handleAuthReady = useCallback(() => setAuthReady(true), []);

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
        {!authReady && <StartAuthForm onReady={handleAuthReady} />}
        {authReady && (
          <>
            <div className="start-actions">
              <button type="button" className="start-button" onClick={onStart}>
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
          </>
        )}
      </div>
    </section>
  );
}
