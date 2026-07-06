import { getIncomeBreakdown, getMinuteIncome, getMinuteIncomeBreakdown, getTaxIncome } from '../lib/economy';
import { formatMoney } from '../lib/format';
import type { CityStats } from '../lib/gameTypes';

type Props = {
  stats: CityStats;
};

export function IncomeTooltip({ stats }: Props) {
  const dayIncome = getIncomeBreakdown(stats)
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  const minuteIncome = getMinuteIncomeBreakdown(stats)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  return (
    <div className="income-help">
      <button type="button" aria-label="Показать статистику доходов">?</button>
      <div className="income-popover">
        <p className="eyebrow">Доходы</p>
        <strong>+{formatMoney(getTaxIncome(stats))} в день</strong>
        <small>Объекты: +{formatMoney(getMinuteIncome(stats))} в минуту</small>
        <IncomeRows title="Больше всего в день" rows={dayIncome} />
        <IncomeRows title="Больше всего в минуту" rows={minuteIncome} />
      </div>
    </div>
  );
}

function IncomeRows({ title, rows }: { title: string; rows: Array<{ label: string; amount: number }> }) {
  if (rows.length === 0) return <small className="income-muted">Пока нет дохода от объектов.</small>;
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
