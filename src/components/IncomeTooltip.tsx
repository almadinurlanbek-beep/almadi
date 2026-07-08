import { getIncomeBreakdown, getMinuteIncome, getMinuteIncomeBreakdown, getTaxIncome } from '../lib/economy';
import { formatMoney } from '../lib/format';
import type { CityStats } from '../lib/gameTypes';
import { useLanguage, type Language } from '../lib/i18n';

type Props = {
  stats: CityStats;
};

export function IncomeTooltip({ stats }: Props) {
  const { language } = useLanguage();
  const text = incomeTooltipText[language];
  const dayIncome = getIncomeBreakdown(stats)
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  const minuteIncome = getMinuteIncomeBreakdown(stats)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  return (
    <div className="income-help">
      <button type="button" aria-label={text.aria}>?</button>
      <div className="income-popover">
        <p className="eyebrow">{text.income}</p>
        <strong>+{formatMoney(getTaxIncome(stats))} {text.perDay}</strong>
        <small>{text.objects}: +{formatMoney(getMinuteIncome(stats))} {text.perMinute}</small>
        <IncomeRows empty={text.empty} title={text.topDay} rows={dayIncome} />
        <IncomeRows empty={text.empty} title={text.topMinute} rows={minuteIncome} />
      </div>
    </div>
  );
}

function IncomeRows({ empty, title, rows }: { empty: string; title: string; rows: Array<{ label: string; amount: number }> }) {
  if (rows.length === 0) return <small className="income-muted">{empty}</small>;
  return (
    <div className="income-popover-group">
      <small>{title}</small>
      {rows.map((item) => (
        <div className="income-popover-row" key={item.label}>
          <span>{item.label}</span>
          <strong>+{formatMoney(item.amount)}</strong>
        </div>
      ))}
    </div>
  );
}

const incomeTooltipText: Record<Language, {
  aria: string;
  empty: string;
  income: string;
  objects: string;
  perDay: string;
  perMinute: string;
  topDay: string;
  topMinute: string;
}> = {
  ru: {
    aria: 'Показать статистику доходов',
    empty: 'Пока нет дохода от объектов.',
    income: 'Доходы',
    objects: 'Объекты',
    perDay: 'в день',
    perMinute: 'в минуту',
    topDay: 'Больше всего в день',
    topMinute: 'Больше всего в минуту',
  },
  en: {
    aria: 'Show income statistics',
    empty: 'No building income yet.',
    income: 'Income',
    objects: 'Buildings',
    perDay: 'per day',
    perMinute: 'per minute',
    topDay: 'Most per day',
    topMinute: 'Most per minute',
  },
  kk: {
    aria: 'Кіріс статистикасын көрсету',
    empty: 'Нысандардан кіріс әлі жоқ.',
    income: 'Кірістер',
    objects: 'Нысандар',
    perDay: 'күніне',
    perMinute: 'минутына',
    topDay: 'Күніне ең көп',
    topMinute: 'Минутына ең көп',
  },
};
