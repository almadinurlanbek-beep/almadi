import { useState } from 'react';
import { formatMoney } from '../lib/format';
import type { CityStats, ResponseMethod } from '../lib/gameTypes';
import { getMissingTeamReason, responseTeams } from '../lib/responseTeams';

type Props = {
  stats: CityStats;
  reward: number;
  responders: number;
  onRewardChange: (value: number) => void;
  onRespondersChange: (value: number) => void;
  onResolve: (method: ResponseMethod, cost: number, people?: number) => void;
};

export function IncidentPanel({ stats, reward, responders, onRewardChange, onRespondersChange, onResolve }: Props) {
  const incident = stats.activeIncident;
  const responses = stats.incidentResponses;
  const investigating = responses.some((response) => isInvestigationResponse(response));
  const [notice, setNotice] = useState('');

  const handleCall = (method: ResponseMethod, cost: number, people?: number) => {
    if (!incident) {
      setNotice('Нельзя вызвать службы: сейчас нет происшествия.');
      return;
    }
    if (responses.some((response) => response.method === method)) {
      setNotice('Эта команда уже работает по происшествию.');
      return;
    }
    setNotice('');
    onResolve(method, cost, people);
  };

  return (
    <section className={`panel incident ${incident ? '' : 'calm'}`}>
      <p className="eyebrow">{incident ? `Источник: ${incident.source}` : 'Происшествия'}</p>
      <h2>{incident ? incident.title : 'Кризисов нет'}</h2>
      <p>{incident ? incident.report : 'Службы готовы, но вызывать их можно только на реальное происшествие.'}</p>
      {incident && <small>Угроза: {incident.severity}/5. Информация может быть неполной или ложной.</small>}
      {investigating && <strong className="call-notice">Статус: расследование</strong>}
      {responses.length > 0 && <strong className="call-notice">В работе: {getResponsesText(responses)}</strong>}
      {notice && <strong className="call-notice">{notice}</strong>}
      <div className="responders-control">
        <span>Людей на вызов</span>
        <button type="button" className="secondary" disabled={responders <= 1} onClick={() => onRespondersChange(responders - 1)}>
          -
        </button>
        <strong>{responders}</strong>
        <button type="button" className="secondary" disabled={responders >= 10} onClick={() => onRespondersChange(responders + 1)}>
          +
        </button>
      </div>
      <div className="team-grid">
        {responseTeams.map((team) => {
          const totalCost = team.cost * responders;
          const missingReason = incident ? getMissingTeamReason(stats, team) : null;
          const moneyReason = incident && stats.money < totalCost ? 'Не хватает денег' : null;
          const responseReason = responses.some((response) => response.method === team.method) ? 'Уже работают' : null;
          const disabledReason = responseReason ?? missingReason ?? moneyReason;
          return (
            <button type="button" key={team.method} disabled={Boolean(disabledReason)} title={disabledReason ?? undefined} onClick={() => handleCall(team.method, totalCost, responders)}>
              <span>{team.name}</span>
              <small>{disabledReason ?? getTeamText(Boolean(incident), totalCost, responders, team.description)}</small>
            </button>
          );
        })}
      </div>
      <div className="actions wrap">
        <button type="button" className="secondary" disabled={responses.some((response) => response.method === 'cameras') || (Boolean(incident) && stats.money < 90)} onClick={() => handleCall('cameras', 90)}>
          Поиск информации - {formatMoney(90)}
        </button>
        <button type="button" className="danger" disabled={responses.length > 0} onClick={() => handleCall('ignore', 0)}>
          Игнорировать
        </button>
      </div>
      <label className="reward">
        <span>Награда за сведения</span>
        <input min="50" max="700" step="50" type="range" value={reward} onChange={(event) => onRewardChange(Number(event.target.value))} />
        <button type="button" className="dark" disabled={responses.some((response) => response.method === 'reward') || (Boolean(incident) && stats.money < reward)} onClick={() => handleCall('reward', reward)}>
          Объявить {formatMoney(reward)}
        </button>
      </label>
    </section>
  );
}

const getTeamText = (hasIncident: boolean, totalCost: number, responders: number, description: string) => {
  if (!hasIncident) return 'Нет происшествия';
  return `${formatMoney(totalCost)} - ${responders} чел. - ${description}`;
};

const getResponsesText = (responses: CityStats['incidentResponses']) => {
  return responses.map((response) => `${getResponseLabel(response.method)} ${response.remainingSeconds} сек.`).join(', ');
};

const getResponseLabel = (method: ResponseMethod) => {
  if (method === 'reward') return 'Награда за информацию';
  if (method === 'cameras') return 'Поиск информации';
  return responseTeams.find((team) => team.method === method)?.name ?? 'Служба';
};

const isInvestigationResponse = (response: CityStats['incidentResponses'][number]) => {
  return response.purpose === 'investigation' || response.method === 'cameras' || response.method === 'reward';
};
