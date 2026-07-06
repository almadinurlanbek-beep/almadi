import { useLanguage } from '../lib/i18n';

type Props = {
  taxRate: number;
  onTaxChange: (delta: number) => void;
};

export function TaxPanel({ taxRate, onTaxChange }: Props) {
  const { t } = useLanguage();
  return (
    <section className="panel tax">
      <div>
        <p className="eyebrow">{t('economy')}</p>
        <h2>{t('tax')}: {taxRate}%</h2>
      </div>
      <div className="actions">
        <button type="button" className="secondary" onClick={() => onTaxChange(-1)}>
          - {t('lower')}
        </button>
        <button type="button" onClick={() => onTaxChange(1)}>
          + {t('raise')}
        </button>
      </div>
    </section>
  );
}
