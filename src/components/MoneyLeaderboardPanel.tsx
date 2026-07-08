import { formatMoney } from '../lib/format';
import { useLanguage, type Language } from '../lib/i18n';
import type { MoneyLeaderboardItem } from '../lib/moneyLeaderboard';

type Props = {
  currentUserId: string | null;
  items: MoneyLeaderboardItem[];
};

export function MoneyLeaderboardPanel({ currentUserId, items }: Props) {
  const { language } = useLanguage();
  const text = leaderboardText[language];

  return (
    <section className="panel leaderboard-panel">
      <div className="leaderboard-heading">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h3>{text.title}</h3>
        </div>
      </div>
      <div className="leaderboard-list">
        {items.length === 0 && <small>{text.empty}</small>}
        {items.map((item, index) => (
          <article className={item.userId === currentUserId ? 'leaderboard-item mine' : 'leaderboard-item'} key={item.userId}>
            <span>{index + 1}</span>
            <div>
              <strong>{item.playerName}</strong>
              <small>{item.userId === currentUserId ? text.you : `${text.city}: ${item.countryId}`}</small>
            </div>
            <b>{formatMoney(item.money)}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

const leaderboardText: Record<Language, { city: string; empty: string; eyebrow: string; title: string; you: string }> = {
  ru: {
    city: 'Город',
    empty: 'Пока нет Gmail-игроков в рейтинге.',
    eyebrow: 'Gmail рейтинг',
    title: 'Лидеры по деньгам',
    you: 'Это ты',
  },
  en: {
    city: 'City',
    empty: 'No Gmail players in the leaderboard yet.',
    eyebrow: 'Gmail leaderboard',
    title: 'Money leaders',
    you: 'This is you',
  },
  kk: {
    city: 'Қала',
    empty: 'Gmail ойыншылары рейтингте әлі жоқ.',
    eyebrow: 'Gmail рейтингі',
    title: 'Ақша бойынша көшбасшылар',
    you: 'Бұл сен',
  },
};
