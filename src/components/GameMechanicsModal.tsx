import { useLanguage, type Language } from '../lib/i18n';

type Props = {
  onClose: () => void;
};

export function GameMechanicsModal({ onClose }: Props) {
  const { language } = useLanguage();
  const text = mechanicsText[language];

  return (
    <div className="mechanics-backdrop" role="presentation" onClick={onClose}>
      <section className="mechanics-modal" role="dialog" aria-modal="true" aria-labelledby="mechanics-title" onClick={(event) => event.stopPropagation()}>
        <div className="mechanics-head">
          <div>
            <p className="eyebrow">{text.eyebrow}</p>
            <h2 id="mechanics-title">{text.title}</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            {text.close}
          </button>
        </div>
        <div className="mechanics-grid">
          {text.sections.map((section) => (
            <article className="mechanics-section" key={section.title}>
              <span>{section.icon}</span>
              <div>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const mechanicsText: Record<Language, {
  close: string;
  eyebrow: string;
  sections: Array<{ body: string; icon: string; title: string }>;
  title: string;
}> = {
  en: {
    close: 'Close',
    eyebrow: 'Guide',
    title: 'Game Mechanics',
    sections: [
      { icon: '🎯', title: 'Goal', body: 'Grow a rich and stable city. Build districts, complete quests, earn money and keep residents safe and happy.' },
      { icon: '💰', title: 'Economy', body: 'Shops, malls, factories, transport and rare buildings bring income every minute. Taxes add money, but high taxes reduce happiness and trust.' },
      { icon: '🏗️', title: 'Buildings', body: 'Homes increase population. Schools, parks, hospitals, police and fire stations improve city stats and help you survive incidents.' },
      { icon: '📉', title: 'City Stats', body: 'Happiness, safety and trust slowly fall over time. Buildings are the main way to raise them back up.' },
      { icon: '⚠️', title: 'Danger', body: 'If happiness falls below 30% or safety below 40%, the city collapses and you must start a new city.' },
      { icon: '⭐', title: 'Progress', body: 'Quests and rewards speed up growth. Tap quest markers on the map to see the task and claim the reward when it is ready.' },
    ],
  },
  ru: {
    close: 'Закрыть',
    eyebrow: 'Справка',
    title: 'Механика игры',
    sections: [
      { icon: '🎯', title: 'Цель игры', body: 'Развивай богатый и стабильный город. Строй районы, выполняй квесты, зарабатывай деньги и удерживай жителей в безопасности и хорошем настроении.' },
      { icon: '💰', title: 'Экономика', body: 'Магазины, ТЦ, заводы, транспорт и редкие здания дают доход каждую минуту. Налоги дают больше денег, но высокий налог снижает счастье и доверие.' },
      { icon: '🏗️', title: 'Стройки', body: 'Дома увеличивают население. Школы, парки, больницы, полиция и пожарные улучшают показатели города и помогают переживать происшествия.' },
      { icon: '📉', title: 'Показатели', body: 'Счастье, безопасность и доверие постепенно падают сами. Главный плюс игрок получает от построек, поэтому город нужно постоянно улучшать.' },
      { icon: '⚠️', title: 'Опасность', body: 'Если счастье упадёт ниже 30% или безопасность ниже 40%, город разрушится и нужно будет начать новый город.' },
      { icon: '⭐', title: 'Прогресс', body: 'Квесты и награды ускоряют развитие. Нажимай на точки квестов на карте, чтобы увидеть задание и забрать награду, когда она готова.' },
    ],
  },
  kk: {
    close: 'Жабу',
    eyebrow: 'Анықтама',
    title: 'Ойын механикасы',
    sections: [
      { icon: '🎯', title: 'Ойын мақсаты', body: 'Бай әрі тұрақты қала дамыт. Аудандар сал, квесттер орында, ақша тап және тұрғындардың қауіпсіздігі мен көңіл күйін сақта.' },
      { icon: '💰', title: 'Экономика', body: 'Дүкендер, СОО, зауыттар, көлік және сирек ғимараттар әр минут сайын табыс береді. Салық ақша әкеледі, бірақ жоғары салық бақыт пен сенімді азайтады.' },
      { icon: '🏗️', title: 'Құрылыстар', body: 'Үйлер халық санын арттырады. Мектеп, саябақ, аурухана, полиция және өрт сөндіру бөлімдері қала көрсеткіштерін жақсартады.' },
      { icon: '📉', title: 'Көрсеткіштер', body: 'Бақыт, қауіпсіздік және сенім уақыт өте өздігінен төмендейді. Оларды көтерудің негізгі жолы - пайдалы ғимараттар салу.' },
      { icon: '⚠️', title: 'Қауіп', body: 'Бақыт 30%-дан немесе қауіпсіздік 40%-дан төмен түссе, қала құлайды және жаңа қала бастау керек болады.' },
      { icon: '⭐', title: 'Прогресс', body: 'Квесттер мен сыйлықтар дамуды жылдамдатады. Картадағы квест нүктесін басып, тапсырманы көр де дайын болғанда сыйлықты ал.' },
    ],
  },
};
