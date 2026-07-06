import { useState } from 'react';
import { requestMayorAdvice } from '../lib/aiAdvisor';
import type { CityStats } from '../lib/gameTypes';

type Props = {
  stats: CityStats;
};

export function AiAdvisorPanel({ stats }: Props) {
  const [advice, setAdvice] = useState('Нажми кнопку, и советник подскажет следующий ход.');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setAdvice(await requestMayorAdvice(stats));
    setLoading(false);
  };

  return (
    <section className="panel ai-advisor">
      <div className="advisor-heading">
        <div>
          <p className="eyebrow">ИИ-советник</p>
          <h3>Совет мэра</h3>
        </div>
        <button type="button" className="secondary" disabled={loading} onClick={handleAsk}>
          {loading ? 'Думает...' : 'Спросить'}
        </button>
      </div>
      <p>{advice}</p>
    </section>
  );
}
