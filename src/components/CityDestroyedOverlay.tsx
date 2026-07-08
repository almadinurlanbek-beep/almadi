import { useLanguage, type Language } from '../lib/i18n';

type Props = {
  reason: string;
  onRestart: () => void;
};

export function CityDestroyedOverlay({ reason, onRestart }: Props) {
  const { language } = useLanguage();
  const text = destroyedText[language];
  return (
    <div className="destroyed-backdrop" role="presentation">
      <section className="destroyed-modal" role="alertdialog" aria-modal="true" aria-labelledby="destroyed-title">
        <p className="eyebrow">{text.eyebrow}</p>
        <h2 id="destroyed-title">{text.title}</h2>
        <p>{text.chaos} {reason}</p>
        <button type="button" className="danger" onClick={onRestart}>
          {text.restart}
        </button>
      </section>
    </div>
  );
}

const destroyedText: Record<Language, { chaos: string; eyebrow: string; restart: string; title: string }> = {
  ru: {
    chaos: 'Начался хаос.',
    eyebrow: 'Кризис города',
    restart: 'Начать новый город',
    title: 'Город разрушен',
  },
  en: {
    chaos: 'Chaos has begun.',
    eyebrow: 'City crisis',
    restart: 'Start a new city',
    title: 'City destroyed',
  },
  kk: {
    chaos: 'Хаос басталды.',
    eyebrow: 'Қала дағдарысы',
    restart: 'Жаңа қала бастау',
    title: 'Қала қирады',
  },
};
