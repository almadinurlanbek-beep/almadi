import { useLanguage, type Language } from '../lib/i18n';

type HappinessWarningProps = {
  advice: string;
  label: string;
  resetLimit: number;
  value: number;
  onClose: () => void;
};

export function HappinessWarning({ advice, label, resetLimit, value, onClose }: HappinessWarningProps) {
  const { language } = useLanguage();
  const text = warningText[language];

  return (
    <div className="warning-backdrop" role="presentation">
      <section className="warning-modal" role="alertdialog" aria-modal="true" aria-labelledby="happiness-warning-title">
        <p className="eyebrow">{text.eyebrow}</p>
        <h2 id="happiness-warning-title">{text.title}</h2>
        <p>
          {text.prefix} {label}: {value}%. {text.limit} {resetLimit}%, {text.result}
        </p>
        <p>{advice}</p>
        <button type="button" className="danger" onClick={onClose}>
          {text.ok}
        </button>
      </section>
    </div>
  );
}

const warningText: Record<Language, { eyebrow: string; limit: string; ok: string; prefix: string; result: string; title: string }> = {
  ru: {
    eyebrow: 'Критический показатель',
    limit: 'Если показатель упадёт ниже',
    ok: 'Понятно',
    prefix: 'Сейчас',
    result: 'город может обнулиться.',
    title: 'ВНИМАНИЕ',
  },
  en: {
    eyebrow: 'Critical stat',
    limit: 'If it falls below',
    ok: 'Got it',
    prefix: 'Current',
    result: 'the city can reset.',
    title: 'WARNING',
  },
  kk: {
    eyebrow: 'Маңызды көрсеткіш',
    limit: 'Егер көрсеткіш төмен түссе',
    ok: 'Түсіндім',
    prefix: 'Қазір',
    result: 'қала қайта басталуы мүмкін.',
    title: 'НАЗАР',
  },
};
