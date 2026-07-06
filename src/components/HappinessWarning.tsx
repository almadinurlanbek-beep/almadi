type HappinessWarningProps = {
  happiness: number;
  resetLimit: number;
  onClose: () => void;
};

export function HappinessWarning({ happiness, resetLimit, onClose }: HappinessWarningProps) {
  return (
    <div className="warning-backdrop" role="presentation">
      <section className="warning-modal" role="alertdialog" aria-modal="true" aria-labelledby="happiness-warning-title">
        <p className="eyebrow">Критическое настроение</p>
        <h2 id="happiness-warning-title">ВНИМАНИЕ</h2>
        <p>
          Счастье города сейчас {happiness}%. Если счастье вашего города достигнет меньше {resetLimit}%,
          тогда ваш город обнулится.
        </p>
        <button type="button" className="danger" onClick={onClose}>
          Понятно
        </button>
      </section>
    </div>
  );
}
