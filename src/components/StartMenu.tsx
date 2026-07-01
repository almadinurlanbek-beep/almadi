type Props = {
  leaving: boolean;
  onStart: () => void;
};

export function StartMenu({ leaving, onStart }: Props) {
  return (
    <section className={`start-menu ${leaving ? 'leaving' : ''}`}>
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="cloud cloud-c" />
      <div className="start-content">
        <p className="eyebrow">City Mayor Simulator</p>
        <h1>Твой город ждёт</h1>
        <button type="button" className="start-button" onClick={onStart}>
          Начать игру
        </button>
      </div>
    </section>
  );
}
