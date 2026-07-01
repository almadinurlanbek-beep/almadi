import { useEffect, useState } from 'react';
import { BuildPanel } from './components/BuildPanel';
import { CityHeader } from './components/CityHeader';
import { CityMap } from './components/CityMap';
import { CountryPanel } from './components/CountryPanel';
import { IncidentPanel } from './components/IncidentPanel';
import { IncomePanel } from './components/IncomePanel';
import { NewsFeed } from './components/NewsFeed';
import { StartMenu } from './components/StartMenu';
import { TaxPanel } from './components/TaxPanel';
import { moveBuilding, refundBuilding, rotateBuilding } from './lib/buildingManagement';
import { createInitialCity } from './lib/gameData';
import { advanceTime, build, changeTax, resolveIncident } from './lib/gameLogic';
import { loadSavedCities, saveCities } from './lib/citySaves';
import { playSound, startAudio } from './lib/soundSystem';
import { useGameSounds } from './lib/useGameSounds';
import type { BuildingId, CityStats, ResponseMethod, TilePoint } from './lib/gameTypes';

export default function App() {
  const [savedGame] = useState(loadSavedCities);
  const [countryId, setCountryId] = useState(savedGame.countryId);
  const [cities, setCities] = useState<Record<string, CityStats>>(savedGame.cities);
  const [screen, setScreen] = useState<'menu' | 'starting' | 'playing'>('menu');
  const [reward, setReward] = useState(150);
  const [responders, setResponders] = useState(1);
  const stats = cities[countryId] ?? createInitialCity(countryId);
  useGameSounds(stats, screen === 'playing');

  const updateCity = (change: (current: CityStats) => CityStats) => {
    setCities((current) => ({
      ...current,
      [countryId]: change(current[countryId] ?? createInitialCity(countryId)),
    }));
  };

  const handleBuild = (id: BuildingId) => {
    playSound('build');
    updateCity((current) => build(current, id));
  };

  const handleTaxChange = (delta: number) => {
    playSound('click');
    updateCity((current) => changeTax(current, delta));
  };

  const handleResolve = (method: ResponseMethod, cost: number, people = 1) => {
    playSound('click');
    updateCity((current) => resolveIncident(current, method, cost, people));
  };

  const handleCountryChange = (nextCountryId: string) => {
    playSound('click');
    setCities((current) => {
      if (current[nextCountryId]) return current;
      return { ...current, [nextCountryId]: createInitialCity(nextCountryId) };
    });
    setCountryId(nextCountryId);
  };

  const handleDeleteBuilding = (buildingId: BuildingId, index: number) => {
    playSound('click');
    updateCity((current) => refundBuilding(current, buildingId, index));
  };

  const handleMoveBuilding = (buildingId: BuildingId, index: number, point: TilePoint) => {
    playSound('build');
    updateCity((current) => moveBuilding(current, buildingId, index, point));
  };

  const handleRotateBuilding = (buildingId: BuildingId, index: number, point: TilePoint) => {
    playSound('click');
    updateCity((current) => rotateBuilding(current, buildingId, index, point));
  };

  const handleStart = () => {
    startAudio();
    setScreen('starting');
    window.setTimeout(() => setScreen('playing'), 1300);
  };

  useEffect(() => {
    saveCities(countryId, cities);
  }, [cities, countryId]);

  useEffect(() => {
    if (screen !== 'playing') return undefined;
    const timerId = window.setInterval(() => {
      setCities((current) => ({
        ...current,
        [countryId]: advanceTime(current[countryId] ?? createInitialCity(countryId)),
      }));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [countryId, screen]);

  return (
    <>
      {screen !== 'playing' && <StartMenu leaving={screen === 'starting'} onStart={handleStart} />}
      <main className={`game ${screen === 'playing' ? 'visible' : 'behind-menu'}`}>
        <CityHeader stats={stats} />
        <div className="layout">
          <div className="left">
            <CountryPanel stats={stats} onCountryChange={handleCountryChange} />
            <TaxPanel taxRate={stats.taxRate} onTaxChange={handleTaxChange} />
            <CityMap stats={stats} onDeleteBuilding={handleDeleteBuilding} onMoveBuilding={handleMoveBuilding} onRotateBuilding={handleRotateBuilding} />
            <IncidentPanel
              stats={stats}
              reward={reward}
              responders={responders}
              onRewardChange={setReward}
              onRespondersChange={setResponders}
              onResolve={handleResolve}
            />
          </div>
          <div className="right">
            <BuildPanel stats={stats} onBuild={handleBuild} />
            <IncomePanel stats={stats} />
            <NewsFeed news={stats.news} />
          </div>
        </div>
      </main>
    </>
  );
}
