import { getIncomeBreakdown, getMinuteIncome, getMinuteIncomeBreakdown, getTaxIncome } from '../lib/economy';
import { formatMoney } from '../lib/format';
import type { CityStats } from '../lib/gameTypes';
import { useLanguage, type Language } from '../lib/i18n';

export function IncomePanel({ stats }: { stats: CityStats }) {
  const { language } = useLanguage();
  const text = incomeText[language];
  const income = getIncomeBreakdown(stats);
  const minuteIncome = getMinuteIncomeBreakdown(stats);

  return (
    <section className="panel income-panel">
      <p className="eyebrow">{text.income}</p>
      <div className="income-total">+{formatMoney(getTaxIncome(stats))}</div>
      <small className="income-minute">{text.objects}: +{formatMoney(getMinuteIncome(stats))} {text.perMinute}</small>
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

const incomeText: Record<Language, { income: string; objects: string; perMinute: string }> = {
  ru: { income: 'Доходы', objects: 'Объекты', perMinute: 'в минуту' },
  en: { income: 'Income', objects: 'Buildings', perMinute: 'per minute' },
  kk: { income: 'Кірістер', objects: 'Нысандар', perMinute: 'минутына' },
};
