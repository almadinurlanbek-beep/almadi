import { useState } from 'react';
import { formatMoney } from '../lib/format';
import type { CityStats, ResponseMethod, ResponseTeam } from '../lib/gameTypes';
import { useLanguage, type Language } from '../lib/i18n';
import { getIncidentText } from '../lib/incidentTranslations';
import { getMissingTeamReason, responseTeams } from '../lib/responseTeams';

type Props = {
  stats: CityStats;
  responders: number;
  onRespondersChange: (value: number) => void;
  onResolve: (method: ResponseMethod, cost: number, people?: number) => void;
};

export function IncidentPanel({ stats, responders, onRespondersChange, onResolve }: Props) {
  const { language } = useLanguage();
  const text = incidentText[language];
  const incident = stats.activeIncident;
  const translatedIncident = incident ? getIncidentText(incident, language) : null;
  const responses = stats.incidentResponses;
  const investigating = responses.some((response) => isInvestigationResponse(response));
  const [notice, setNotice] = useState('');

  const handleCall = (method: ResponseMethod, cost: number, people?: number) => {
    if (!incident) {
      setNotice(text.noIncidentNotice);
      return;
    }
    if (responses.some((response) => response.method === method)) {
      setNotice(text.alreadyWorkingNotice);
      return;
    }
    setNotice('');
    onResolve(method, cost, people);
  };

  return (
    <section className={`panel incident ${incident ? '' : 'calm'}`} id="incident-panel">
      <p className="eyebrow">{translatedIncident ? `${text.source}: ${translatedIncident.source}` : text.incidents}</p>
      <h2>{translatedIncident ? translatedIncident.title : text.noCrises}</h2>
      <p>{translatedIncident ? translatedIncident.report : text.calmText}</p>
      {incident && <small>{text.threat}: {incident.severity}/5. {text.infoMayBeWrong}</small>}
      {incident && <strong className="call-notice">{text.left}: {formatIncidentTime(incident.remainingSeconds ?? 120)}</strong>}
      {investigating && <strong className="call-notice">{text.status}: {text.investigation}</strong>}
      {responses.length > 0 && <strong className="call-notice">{text.inProgress}: {getResponsesText(responses, language)}</strong>}
      {notice && <strong className="call-notice">{notice}</strong>}
      <div className="responders-control">
        <span>{text.peopleOnCall}</span>
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
          const teamInfo = getTeamInfo(team, language);
          const totalCost = team.cost * responders;
          const missingReason = incident && getMissingTeamReason(stats, team) ? getMissingReason(team, language) : null;
          const moneyReason = incident && stats.money < totalCost ? text.notEnoughMoney : null;
          const responseReason = responses.some((response) => response.method === team.method) ? text.alreadyWorking : null;
          const disabledReason = responseReason ?? missingReason ?? moneyReason;
          return (
            <button type="button" key={team.method} disabled={Boolean(disabledReason)} title={disabledReason ?? undefined} onClick={() => handleCall(team.method, totalCost, responders)}>
              <span>{teamInfo.name}</span>
              <small>{disabledReason ?? getTeamText(Boolean(incident), totalCost, responders, teamInfo.description, text)}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const getTeamText = (hasIncident: boolean, totalCost: number, responders: number, description: string, text: IncidentText) => {
  if (!hasIncident) return text.noIncident;
  return `${formatMoney(totalCost)} - ${responders} ${text.peopleShort} - ${description}`;
};

const getResponsesText = (responses: CityStats['incidentResponses'], language: Language) => {
  const text = incidentText[language];
  return responses.map((response) => `${getResponseLabel(response.method, language)} ${response.remainingSeconds} ${text.seconds}`).join(', ');
};

const getResponseLabel = (method: ResponseMethod, language: Language) => {
  if (method === 'reward') return incidentText[language].infoReward;
  if (method === 'cameras') return incidentText[language].infoSearch;
  return teamText[language][method]?.name ?? incidentText[language].service;
};

const getMissingReason = (team: ResponseTeam, language: Language) => {
  if (team.requiredBuilding === 'police') return missingReasonText[language].police;
  if (team.requiredBuilding === 'hospitals') return missingReasonText[language].hospital;
  if (team.requiredBuilding === 'fireStations') return missingReasonText[language].fire;
  return missingReasonText[language].service;
};

const formatIncidentTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${(safeSeconds % 60).toString().padStart(2, '0')}`;
};

const isInvestigationResponse = (response: CityStats['incidentResponses'][number]) => {
  return response.purpose === 'investigation' || response.method === 'cameras' || response.method === 'reward';
};

type IncidentText = {
  alreadyWorking: string;
  alreadyWorkingNotice: string;
  calmText: string;
  incidents: string;
  infoMayBeWrong: string;
  infoReward: string;
  infoSearch: string;
  inProgress: string;
  investigation: string;
  left: string;
  noCrises: string;
  noIncident: string;
  noIncidentNotice: string;
  notEnoughMoney: string;
  peopleOnCall: string;
  peopleShort: string;
  seconds: string;
  service: string;
  source: string;
  status: string;
  threat: string;
};

const incidentText: Record<Language, IncidentText> = {
  en: {
    alreadyWorking: 'Already working',
    alreadyWorkingNotice: 'This team is already working on the incident.',
    calmText: 'Services are ready, but they can only be sent to a real incident.',
    incidents: 'Incidents',
    infoMayBeWrong: 'Information may be incomplete or false.',
    infoReward: 'Information reward',
    infoSearch: 'Information search',
    inProgress: 'In progress',
    investigation: 'investigation',
    left: 'Left',
    noCrises: 'No crises',
    noIncident: 'No incident',
    noIncidentNotice: 'Cannot call services: there is no incident now.',
    notEnoughMoney: 'Not enough money',
    peopleOnCall: 'People on call',
    peopleShort: 'people',
    seconds: 'sec.',
    service: 'Service',
    source: 'Source',
    status: 'Status',
    threat: 'Threat',
  },
  ru: {
    alreadyWorking: 'Уже работают',
    alreadyWorkingNotice: 'Эта команда уже работает по происшествию.',
    calmText: 'Службы готовы, но вызывать их можно только на реальное происшествие.',
    incidents: 'Происшествия',
    infoMayBeWrong: 'Информация может быть неполной или ложной.',
    infoReward: 'Награда за информацию',
    infoSearch: 'Поиск информации',
    inProgress: 'В работе',
    investigation: 'расследование',
    left: 'Осталось',
    noCrises: 'Кризисов нет',
    noIncident: 'Нет происшествия',
    noIncidentNotice: 'Нельзя вызвать службы: сейчас нет происшествия.',
    notEnoughMoney: 'Не хватает денег',
    peopleOnCall: 'Людей на вызов',
    peopleShort: 'чел.',
    seconds: 'сек.',
    service: 'Служба',
    source: 'Источник',
    status: 'Статус',
    threat: 'Угроза',
  },
  kk: {
    alreadyWorking: 'Жұмыс істеп жатыр',
    alreadyWorkingNotice: 'Бұл команда оқиға бойынша қазірдің өзінде жұмыс істеп жатыр.',
    calmText: 'Қызметтер дайын, бірақ оларды нақты оқиғаға ғана шақыруға болады.',
    incidents: 'Оқиғалар',
    infoMayBeWrong: 'Ақпарат толық емес немесе жалған болуы мүмкін.',
    infoReward: 'Ақпарат үшін сыйақы',
    infoSearch: 'Ақпарат іздеу',
    inProgress: 'Жұмыста',
    investigation: 'тергеу',
    left: 'Қалды',
    noCrises: 'Дағдарыс жоқ',
    noIncident: 'Оқиға жоқ',
    noIncidentNotice: 'Қызметтерді шақыруға болмайды: қазір оқиға жоқ.',
    notEnoughMoney: 'Ақша жетпейді',
    peopleOnCall: 'Шақырудағы адам',
    peopleShort: 'адам',
    seconds: 'сек.',
    service: 'Қызмет',
    source: 'Дереккөз',
    status: 'Статус',
    threat: 'Қауіп',
  },
};

const teamText: Record<Language, Partial<Record<ResponseMethod, { description: string; name: string }>>> = {
  en: {
    ambulance: { name: 'Ambulance', description: 'injuries, illness, terror attacks' },
    detectives: { name: 'Detectives', description: 'suspects and rumor checks' },
    engineers: { name: 'Engineers', description: 'robots, infrastructure, failures' },
    epidemiologists: { name: 'Epidemiologists', description: 'epidemics and mass illness' },
    firefighters: { name: 'Firefighters', description: 'fires and accidents' },
    negotiators: { name: 'Negotiators', description: 'protests and public panic' },
    police: { name: 'Police', description: 'crime, chases, terror, protests' },
    rescuers: { name: 'Rescuers', description: 'fires and evacuation' },
  },
  ru: {
    ambulance: { name: 'Скорая', description: 'пострадавшие, болезни, теракты' },
    detectives: { name: 'Детективы', description: 'поиск подозреваемых и проверка слухов' },
    engineers: { name: 'Инженеры', description: 'роботы, инфраструктура, сбои' },
    epidemiologists: { name: 'Эпидемиологи', description: 'эпидемии и массовые болезни' },
    firefighters: { name: 'Пожарные', description: 'пожары и аварии' },
    negotiators: { name: 'Переговорщики', description: 'протесты и паника жителей' },
    police: { name: 'Полиция', description: 'преступления, погони, теракты, протесты' },
    rescuers: { name: 'Спасатели', description: 'пожары и эвакуация' },
  },
  kk: {
    ambulance: { name: 'Жедел жәрдем', description: 'зардап шеккендер, аурулар, теракт' },
    detectives: { name: 'Детективтер', description: 'күдіктілерді іздеу және қауесетті тексеру' },
    engineers: { name: 'Инженерлер', description: 'роботтар, инфрақұрылым, ақаулар' },
    epidemiologists: { name: 'Эпидемиологтар', description: 'эпидемиялар және жаппай аурулар' },
    firefighters: { name: 'Өрт сөндірушілер', description: 'өрттер және апаттар' },
    negotiators: { name: 'Келіссөз жүргізушілер', description: 'наразылық және тұрғындар дүрбелеңі' },
    police: { name: 'Полиция', description: 'қылмыс, қуғын, теракт, наразылық' },
    rescuers: { name: 'Құтқарушылар', description: 'өрттер және эвакуация' },
  },
};

const getTeamInfo = (team: ResponseTeam, language: Language) => teamText[language][team.method] ?? { name: team.name, description: team.description };

const missingReasonText: Record<Language, { fire: string; hospital: string; police: string; service: string }> = {
  en: { fire: 'No fire station', hospital: 'No hospital', police: 'No police station', service: 'Required service is missing' },
  ru: { fire: 'Нет пожарной станции', hospital: 'Нет больницы', police: 'Нет полицейского участка', service: 'Нет нужной службы' },
  kk: { fire: 'Өрт сөндіру станциясы жоқ', hospital: 'Аурухана жоқ', police: 'Полиция бөлімі жоқ', service: 'Қажетті қызмет жоқ' },
};
