import { useLanguage, type Language } from '../lib/i18n';

export function MobileQuickNav() {
  const { language } = useLanguage();
  const text = quickNavText[language];

  return (
    <nav className="mobile-quick-nav" aria-label={text.aria}>
      <a href="#city-map"><span>□</span>{text.map}</a>
      <a href="#build-panel"><span>+</span>{text.build}</a>
      <a href="#quest-panel"><span>?</span>{text.quests}</a>
      <a href="#incident-panel"><span>!</span>{text.incidents}</a>
    </nav>
  );
}

const quickNavText: Record<Language, { aria: string; build: string; incidents: string; map: string; quests: string }> = {
  en: {
    aria: 'Quick game navigation',
    build: 'Build',
    incidents: 'Events',
    map: 'Map',
    quests: 'Quests',
  },
  ru: {
    aria: 'Быстрая навигация игры',
    build: 'Стройка',
    incidents: 'События',
    map: 'Карта',
    quests: 'Квесты',
  },
  kk: {
    aria: 'Ойынның жылдам навигациясы',
    build: 'Құрылыс',
    incidents: 'Оқиға',
    map: 'Карта',
    quests: 'Квест',
  },
};
