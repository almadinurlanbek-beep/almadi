import { useEffect, useState } from 'react';
import { requestMayorAdvice } from '../lib/aiAdvisor';
import type { CityStats } from '../lib/gameTypes';
import { useLanguage } from '../lib/i18n';

type Props = {
  stats: CityStats;
};

export function AiAdvisorPanel({ stats }: Props) {
  const { language, t } = useLanguage();
  const [advice, setAdvice] = useState(t('advisorStart'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAdvice(t('advisorStart'));
  }, [language, t]);

  const handleAsk = async () => {
    setLoading(true);
    try {
      setAdvice(await requestMayorAdvice(stats, language));
    } catch {
      setAdvice(t('advisorError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel ai-advisor">
      <div className="advisor-heading">
        <div>
          <p className="eyebrow">{t('advisorEyebrow')}</p>
          <h3>{t('mayorAdvice')}</h3>
        </div>
        <button type="button" className="secondary" disabled={loading} onClick={handleAsk}>
          {loading ? t('thinking') : t('ask')}
        </button>
      </div>
      <p>{advice}</p>
    </section>
  );
}
