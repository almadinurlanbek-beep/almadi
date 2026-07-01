type Props = {
  taxRate: number;
  onTaxChange: (delta: number) => void;
};

export function TaxPanel({ taxRate, onTaxChange }: Props) {
  return (
    <section className="panel tax">
      <div>
        <p className="eyebrow">Экономика</p>
        <h2>Налог: {taxRate}%</h2>
      </div>
      <div className="actions">
        <button type="button" className="secondary" onClick={() => onTaxChange(-1)}>
          - Снизить
        </button>
        <button type="button" onClick={() => onTaxChange(1)}>
          + Повысить
        </button>
      </div>
    </section>
  );
}
