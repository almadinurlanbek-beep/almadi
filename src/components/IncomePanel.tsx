import { getIncomeBreakdown, getMinuteIncomeBreakdown, getTaxIncome } from '../lib/economy';
import { formatMoney } from '../lib/format';
import type { CityStats } from '../lib/gameTypes';

export function IncomePanel({ stats }: { stats: CityStats }) {
  const income = getIncomeBreakdown(stats);
  const minuteIncome = getMinuteIncomeBreakdown(stats);

  return (
    <section className="panel income-panel">
      <p className="eyebrow">Доходы</p>
      <div className="income-total">+{formatMoney(getTaxIncome(stats))}</div>
      <ul className="income-list">
        {[...income, ...minuteIncome].map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <strong>+{formatMoney(item.amount)}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
