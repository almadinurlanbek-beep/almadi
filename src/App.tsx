import { useEffect, useMemo, useState } from 'react';
import { BuildPanel } from './components/BuildPanel';
import { AiAdvisorPanel } from './components/AiAdvisorPanel';
import { CityHeader } from './components/CityHeader';
import { CityMap } from './components/CityMap';
import { CountryPanel } from './components/CountryPanel';
import { DailyRewardPanel } from './components/DailyRewardPanel';
import { EventNotifications } from './components/EventNotifications';
import { FriendsPanel } from './components/FriendsPanel';
import { HappinessWarning } from './components/HappinessWarning';
import { IncidentPanel } from './components/IncidentPanel';
import { PlaytimeRewardPanel } from './components/PlaytimeRewardPanel';
import { QuestPanel } from './components/QuestPanel';
import { StartMenu } from './components/StartMenu';
import { TaxPanel } from './components/TaxPanel';
import { moveBuilding, refundBuilding, rotateBuilding } from './lib/buildingManagement';
import { createInitialCity } from './lib/gameData';
import { claimDailyReward, loadDailyRewardState } from './lib/dailyRewards';
import { addPlaytimeSecond, claimPlaytimeReward, loadPlaytimeRewardState, type PlaytimeRewardId } from './lib/playtimeRewards';
import { DEFEAT_HAPPINESS, HAPPINESS_WARNING_LIMIT, advanceTime, build, changeTax, resolveIncident } from './lib/gameLogic';
import { loadFriendSavedCities, loadSavedCities, loadUserSavedCities, saveCities, saveUserCities } from './lib/citySaves';
import { acceptFriend, loadFriends, requestFriend, upsertProfile, type FriendItem, type FriendRequestResult } from './lib/friends';
import { playSound, startAudio } from './lib/soundSystem';
import { supabase } from './lib/supabase';
import { useEventNotifications } from './lib/useEventNotifications';
import { completeAiQuest, generateAiQuest, getAiQuestProgress, type AiQuest } from './lib/aiQuests';
import { claimHourlyQuestReward, ensureHourlyQuests, getHourlyQuestStatuses } from './lib/hourlyQuests';
import { createQuestMapMarkers } from './lib/questMapMarkers';
import { claimQuestReward, getQuestStatuses } from './lib/quests';
import { useLanguage } from './lib/i18n';
import type { BuildingId, CityStats, ResponseMethod, TilePoint } from './lib/gameTypes';
import type { Session } from '@supabase/supabase-js';

type FriendCityView = {
  countryId: string;
  cities: Record<string, CityStats>;
  friend: FriendItem;
};

const getFriendRequestMessage = (result: FriendRequestResult) => {
  if (result === 'sent') return 'Заявка отправлена. Друг должен принять её у себя.';
  if (result === 'accepted') return 'Входящая заявка найдена и принята. Можно смотреть город друга.';
  if (result === 'already_friends') return 'Этот игрок уже у тебя в друзьях.';
  if (result === 'already_sent') return 'Заявка уже отправлена. Подожди, пока друг её примет.';
  if (result === 'self') return 'Себя добавить нельзя. Нужен email другого игрока.';
  return 'Игрок с таким email не найден. Друг должен хотя бы раз войти в игру.';
};

export default function App() {
  const { t } = useLanguage();
  const [savedGame] = useState(loadSavedCities);
  const [countryId, setCountryId] = useState(savedGame.countryId);
  const [cities, setCities] = useState<Record<string, CityStats>>(savedGame.cities);
  const [screen, setScreen] = useState<'menu' | 'starting' | 'playing'>('menu');
  const [reward, setReward] = useState(150);
  const [dailyReward, setDailyReward] = useState(loadDailyRewardState);
  const [playtimeReward, setPlaytimeReward] = useState(loadPlaytimeRewardState);
  const [responders, setResponders] = useState(1);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudReady, setCloudReady] = useState(false);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendMessage, setFriendMessage] = useState<string | null>(null);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [friendView, setFriendView] = useState<FriendCityView | null>(null);
  const [aiQuest, setAiQuest] = useState<AiQuest | null>(null);
  const [aiQuestLoading, setAiQuestLoading] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [isHappinessWarningOpen, setIsHappinessWarningOpen] = useState(false);
  const [isHappinessWarningDismissed, setIsHappinessWarningDismissed] = useState(false);
  const stats = cities[countryId] ?? createInitialCity(countryId);
  const viewedStats = friendView ? friendView.cities[friendView.countryId] ?? createInitialCity(friendView.countryId) : stats;
  const eventNotifications = useEventNotifications(stats, screen === 'playing' && !friendView);
  const questMarkers = useMemo(() => {
    const mayor = getQuestStatuses(stats)
      .filter((quest) => !quest.claimed)
      .map((quest) => ({ id: quest.id, kind: 'mayor' as const, title: quest.title, completed: quest.completed }));
    const hourly = getHourlyQuestStatuses(stats).map((quest) => ({ id: quest.id, kind: 'hourly' as const, title: quest.title, completed: quest.completed }));
    const ai = aiQuest ? [{ id: aiQuest.id, kind: 'ai' as const, title: aiQuest.title, completed: getAiQuestProgress(aiQuest, stats) >= aiQuest.target }] : [];
    return createQuestMapMarkers([...ai, ...hourly, ...mayor]);
  }, [aiQuest, stats]);

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

  const handleDailyReward = () => {
    const result = claimDailyReward(dailyReward);
    if (!result) return;
    playSound('click');
    setDailyReward(result.state);
    updateCity((current) => ({
      ...current,
      money: current.money + result.amount,
      news: [`Ежедневная награда: день ${result.day}, +$${result.amount.toLocaleString('ru-RU')}.`, ...current.news].slice(0, 7),
    }));
  };

  const handlePlaytimeReward = (id: PlaytimeRewardId) => {
    const result = claimPlaytimeReward(playtimeReward, id);
    if (!result) return;
    playSound('click');
    setPlaytimeReward(result.state);
    updateCity((current) => ({
      ...current,
      money: current.money + result.amount,
      news: [`Бесплатная награда: ${result.label}, +$${result.amount.toLocaleString('ru-RU')}.`, ...current.news].slice(0, 7),
    }));
  };

  const handleQuestClaim = (questId: string) => {
    playSound('success');
    updateCity((current) => claimQuestReward(current, questId));
    setSelectedQuestId(null);
  };

  const handleHourlyQuestClaim = (questId: string) => {
    playSound('success');
    updateCity((current) => claimHourlyQuestReward(current, questId));
    setSelectedQuestId(null);
  };

  const handleGenerateAiQuest = async () => {
    setAiQuestLoading(true);
    try {
      const quest = await generateAiQuest(stats);
      playSound('click');
      setAiQuest(quest);
      setSelectedQuestId(quest.id);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'неизвестная ошибка';
      updateCity((current) => ({
        ...current,
        news: [`ИИ сейчас не смог придумать задание: ${message}`, ...current.news].slice(0, 7),
      }));
    } finally {
      setAiQuestLoading(false);
    }
  };

  const handleAdvisorQuestReady = (quest: AiQuest) => {
    playSound('click');
    setAiQuest(quest);
    setSelectedQuestId(quest.id);
  };

  const handleAiQuestClaim = async () => {
    if (!aiQuest || getAiQuestProgress(aiQuest, stats) < aiQuest.target) return;
    playSound('success');
    const completedStats = completeAiQuest(stats, aiQuest);
    setAiQuest(null);
    updateCity(() => completedStats);
    setAiQuestLoading(true);
    try {
      const nextQuest = await generateAiQuest(completedStats);
      setAiQuest(nextQuest);
      setSelectedQuestId(nextQuest.id);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'неизвестная ошибка';
      updateCity((current) => ({
        ...current,
        news: [`ИИ не смог придумать новый квест: ${message}`, ...current.news].slice(0, 7),
      }));
    } finally {
      setAiQuestLoading(false);
    }
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
    setFriendView(null);
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
    if (!session?.user) return;
    startAudio();
    setScreen('starting');
    window.setTimeout(() => setScreen('playing'), 1300);
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error(error);
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setScreen('menu');
    setCloudReady(false);
    setFriendView(null);
    setFriends([]);
    setFriendMessage(null);
    setFriendLoading(false);
    await supabase.auth.signOut();
  };

  const refreshFriends = async (userId: string) => {
    const nextFriends = await loadFriends(userId);
    setFriends(nextFriends);
  };

  const handleAddFriend = async (email: string) => {
    const userId = session?.user.id;
    if (!userId) return;
    setFriendLoading(true);
    setFriendMessage(null);
    try {
      const result = await requestFriend(email, userId);
      await refreshFriends(userId);
      setFriendMessage(getFriendRequestMessage(result));
    } catch (error) {
      console.error(error);
      setFriendMessage('Не получилось добавить друга. Проверь email или попробуй позже.');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleAcceptFriend = async (friendshipId: string) => {
    const userId = session?.user.id;
    if (!userId) return;
    setFriendLoading(true);
    setFriendMessage(null);
    try {
      await acceptFriend(friendshipId);
      await refreshFriends(userId);
      setFriendMessage('Заявка принята. Теперь можно смотреть город друга.');
    } catch (error) {
      console.error(error);
      setFriendMessage('Не получилось принять заявку. Попробуй позже.');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleViewFriendCity = async (friend: FriendItem) => {
    setFriendLoading(true);
    setFriendMessage(null);
    try {
      const saved = await loadFriendSavedCities(friend.userId);
      if (!saved) {
        setFriendMessage('У друга пока нет сохранённого города.');
        return;
      }
      setFriendView({ ...saved, friend });
      setIsFriendsOpen(false);
    } catch (error) {
      console.error(error);
      setFriendMessage('Не получилось открыть город друга. Возможно, миграции ещё не применены.');
    } finally {
      setFriendLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) upsertProfile(data.session).catch((error: unknown) => console.error(error));
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) upsertProfile(nextSession).catch((error: unknown) => console.error(error));
      if (!nextSession) setScreen('menu');
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!session?.user) {
      setCloudReady(false);
      return undefined;
    }

    setAuthLoading(true);
    loadUserSavedCities()
      .then((saved) => {
        if (!active) return;
        if (saved) {
          setCountryId(saved.countryId);
          setCities(saved.cities);
        } else {
          saveUserCities(countryId, cities).catch((error: unknown) => console.error(error));
        }
        refreshFriends(session.user.id).catch((error: unknown) => console.error(error));
        setCloudReady(true);
      })
      .catch((error: unknown) => console.error(error))
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    saveCities(countryId, cities);
    if (!session?.user || !cloudReady) return undefined;

    const timerId = window.setTimeout(() => {
      saveUserCities(countryId, cities).catch((error: unknown) => console.error(error));
    }, 800);

    return () => window.clearTimeout(timerId);
  }, [cities, cloudReady, countryId, session?.user]);

  useEffect(() => {
    if (screen !== 'playing') return;
    if (stats.happiness >= HAPPINESS_WARNING_LIMIT) {
      setIsHappinessWarningDismissed(false);
      setIsHappinessWarningOpen(false);
      return;
    }
    if (!isHappinessWarningDismissed) setIsHappinessWarningOpen(true);
  }, [isHappinessWarningDismissed, screen, stats.happiness]);

  useEffect(() => {
    if (screen !== 'playing') return undefined;
    const timerId = window.setInterval(() => {
      setPlaytimeReward((current) => addPlaytimeSecond(current));
      setCities((current) => ({
        ...current,
        [countryId]: ensureHourlyQuests(advanceTime(current[countryId] ?? createInitialCity(countryId))),
      }));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [countryId, screen]);

  return (
    <>
      {screen !== 'playing' && (
        <StartMenu
          authLoading={authLoading}
          isSignedIn={Boolean(session?.user)}
          leaving={screen === 'starting'}
          userName={session?.user.email ?? null}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          onStart={handleStart}
        />
      )}
      <main className={`game ${screen === 'playing' ? 'visible' : 'behind-menu'}`}>
        <EventNotifications notifications={eventNotifications.notifications} onDismiss={eventNotifications.dismissNotification} />
        {isHappinessWarningOpen && (
          <HappinessWarning
            happiness={stats.happiness}
            resetLimit={DEFEAT_HAPPINESS}
            onClose={() => {
              setIsHappinessWarningOpen(false);
              setIsHappinessWarningDismissed(true);
            }}
          />
        )}
        <CityHeader
          friendCount={friends.filter((friend) => friend.status === 'accepted').length}
          stats={viewedStats}
          onOpenFriends={() => setIsFriendsOpen(true)}
        />
        {isFriendsOpen && (
          <div className="friends-modal-backdrop">
            <div className="friends-modal">
              <div className="friends-modal-head">
                <div>
                  <p className="eyebrow">{t('friends')}</p>
                  <h2>{t('addFriend')}</h2>
                </div>
                <button type="button" className="secondary" onClick={() => setIsFriendsOpen(false)}>
                  {t('close')}
                </button>
              </div>
              <FriendsPanel
                friends={friends}
                loading={friendLoading}
                message={friendMessage}
                onAccept={handleAcceptFriend}
                onAdd={handleAddFriend}
                onViewCity={handleViewFriendCity}
              />
            </div>
          </div>
        )}
        <div className="layout">
          <div className="left">
            {friendView && (
              <section className="panel friend-view">
                <div>
                  <p className="eyebrow">{t('viewCity')}</p>
                  <strong>{friendView.friend.displayName ?? friendView.friend.email}</strong>
                </div>
                <button type="button" className="secondary" onClick={() => setFriendView(null)}>
                  {t('myCity')}
                </button>
              </section>
            )}
            {!friendView && <CountryPanel stats={stats} onCountryChange={handleCountryChange} />}
            {!friendView && <TaxPanel taxRate={stats.taxRate} onTaxChange={handleTaxChange} />}
            <CityMap
              readOnly={Boolean(friendView)}
              questMarkers={questMarkers}
              stats={viewedStats}
              onDeleteBuilding={handleDeleteBuilding}
              onQuestMarkerClick={setSelectedQuestId}
              onMoveBuilding={handleMoveBuilding}
              onRotateBuilding={handleRotateBuilding}
            />
            {!friendView && (
              <IncidentPanel
                stats={stats}
                reward={reward}
                responders={responders}
                onRewardChange={setReward}
                onRespondersChange={setResponders}
                onResolve={handleResolve}
              />
            )}
          </div>
          <div className="right">
            <FriendsPanel
              friends={friends}
              loading={friendLoading}
              message={friendMessage}
              onAccept={handleAcceptFriend}
              onAdd={handleAddFriend}
              onViewCity={handleViewFriendCity}
            />
            {!friendView && <AiAdvisorPanel stats={stats} activeQuest={aiQuest} onQuestReady={handleAdvisorQuestReady} />}
            {!friendView && (
              <QuestPanel
                aiQuest={aiQuest}
                aiQuestLoading={aiQuestLoading}
                selectedQuestId={selectedQuestId}
                stats={stats}
                onClaimAiQuest={handleAiQuestClaim}
                onClaimHourlyQuest={handleHourlyQuestClaim}
                onClaim={handleQuestClaim}
                onGenerateAiQuest={handleGenerateAiQuest}
              />
            )}
            {!friendView && <DailyRewardPanel reward={dailyReward} onClaim={handleDailyReward} />}
            {!friendView && <PlaytimeRewardPanel reward={playtimeReward} onClaim={handlePlaytimeReward} />}
            {!friendView && <BuildPanel stats={stats} onBuild={handleBuild} />}
          </div>
        </div>
      </main>
    </>
  );
}
