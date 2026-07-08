import { useEffect, useMemo, useState } from 'react';
import { BuildPanel } from './components/BuildPanel';
import { AiAdvisorPanel } from './components/AiAdvisorPanel';
import { CityHeader } from './components/CityHeader';
import { CityDestroyedOverlay } from './components/CityDestroyedOverlay';
import { CityMap } from './components/CityMap';
import { CountryPanel } from './components/CountryPanel';
import { DailyRewardPanel } from './components/DailyRewardPanel';
import { EventNotifications } from './components/EventNotifications';
import { FriendsPanel } from './components/FriendsPanel';
import { HappinessWarning } from './components/HappinessWarning';
import { IncidentPanel } from './components/IncidentPanel';
import { MoneyLeaderboardPanel } from './components/MoneyLeaderboardPanel';
import { MobileQuickNav } from './components/MobileQuickNav';
import { PlaytimeRewardPanel } from './components/PlaytimeRewardPanel';
import { QuestPanel } from './components/QuestPanel';
import { QuestRewardModal } from './components/QuestRewardModal';
import { SettingsPanel } from './components/SettingsPanel';
import { StartMenu } from './components/StartMenu';
import { TaxPanel } from './components/TaxPanel';
import { YouTubeMusicPlayer } from './components/YouTubeMusicPlayer';
import { moveBuilding, refundBuilding, rotateBuilding } from './lib/buildingManagement';
import { createInitialCity } from './lib/gameData';
import { claimDailyReward, loadDailyRewardState } from './lib/dailyRewards';
import { addPlaytimeSecond, claimPlaytimeReward, loadPlaytimeRewardState, type PlaytimeRewardId } from './lib/playtimeRewards';
import { DEFEAT_HAPPINESS, advanceTime, build, changeTax, resolveIncident } from './lib/gameLogic';
import { loadFriendSavedCities, loadSavedCities, loadUserSavedCities, saveCities, saveUserCities } from './lib/citySaves';
import { acceptFriend, loadFriends, requestFriend, upsertProfile, type FriendItem, type FriendRequestResult } from './lib/friends';
import { loadGameSettings, saveGameSettings, type GameSettings } from './lib/gameSettings';
import { applyAudioSettings, playSound, startAudio } from './lib/soundSystem';
import { supabase } from './lib/supabase';
import { useEventNotifications } from './lib/useEventNotifications';
import { completeAiQuest, generateAiQuest, getAiQuestProgress, type AiQuest } from './lib/aiQuests';
import { claimHourlyQuestReward, ensureHourlyQuests, getHourlyQuestStatuses } from './lib/hourlyQuests';
import { loadMoneyLeaderboard, saveMoneyLeaderboard, type MoneyLeaderboardItem } from './lib/moneyLeaderboard';
import { createQuestMapMarkers } from './lib/questMapMarkers';
import { getQuestTitle } from './lib/questTranslations';
import { getSelectedQuest } from './lib/questSelection';
import { claimQuestReward, getQuestStatuses } from './lib/quests';
import { useLanguage, type Language } from './lib/i18n';
import type { BuildingId, CityStats, ResponseMethod, TilePoint } from './lib/gameTypes';
import type { Session } from '@supabase/supabase-js';

type FriendCityView = {
  countryId: string;
  cities: Record<string, CityStats>;
  friend: FriendItem;
};

type StatusWarning = {
  advice: string;
  key: 'happiness' | 'safety' | 'trust';
  label: string;
  resetLimit: number;
  value: number;
};

const STATUS_WARNING_LIMIT = 45;
const DEFEAT_SAFETY_LIMIT = 40;
const DEFEAT_TRUST_LIMIT = 39;

const getFriendRequestMessage = (result: FriendRequestResult) => {
  if (result === 'sent') return 'Р—Р°СЏРІРєР° РѕС‚РїСЂР°РІР»РµРЅР°. Р”СЂСѓРі РґРѕР»Р¶РµРЅ РїСЂРёРЅСЏС‚СЊ РµС‘ Сѓ СЃРµР±СЏ.';
  if (result === 'accepted') return 'Р’С…РѕРґСЏС‰Р°СЏ Р·Р°СЏРІРєР° РЅР°Р№РґРµРЅР° Рё РїСЂРёРЅСЏС‚Р°. РњРѕР¶РЅРѕ СЃРјРѕС‚СЂРµС‚СЊ РіРѕСЂРѕРґ РґСЂСѓРіР°.';
  if (result === 'already_friends') return 'Р­С‚РѕС‚ РёРіСЂРѕРє СѓР¶Рµ Сѓ С‚РµР±СЏ РІ РґСЂСѓР·СЊСЏС….';
  if (result === 'already_sent') return 'Р—Р°СЏРІРєР° СѓР¶Рµ РѕС‚РїСЂР°РІР»РµРЅР°. РџРѕРґРѕР¶РґРё, РїРѕРєР° РґСЂСѓРі РµС‘ РїСЂРёРјРµС‚.';
  if (result === 'self') return 'РЎРµР±СЏ РґРѕР±Р°РІРёС‚СЊ РЅРµР»СЊР·СЏ. РќСѓР¶РµРЅ email РґСЂСѓРіРѕРіРѕ РёРіСЂРѕРєР°.';
  return 'РРіСЂРѕРє СЃ С‚Р°РєРёРј email РЅРµ РЅР°Р№РґРµРЅ. Р”СЂСѓРі РґРѕР»Р¶РµРЅ С…РѕС‚СЏ Р±С‹ СЂР°Р· РІРѕР№С‚Рё РІ РёРіСЂСѓ.';
};

const getStatusWarning = (stats: CityStats, dismissed: StatusWarning['key'][], language: Language): StatusWarning | null => {
  const text = statusWarningText[language];
  const warnings: StatusWarning[] = [
    {
      advice: text.happinessAdvice,
      key: 'happiness',
      label: text.happiness,
      resetLimit: DEFEAT_HAPPINESS,
      value: stats.happiness,
    },
    {
      advice: text.safetyAdvice,
      key: 'safety',
      label: text.safety,
      resetLimit: DEFEAT_SAFETY_LIMIT,
      value: stats.safety,
    },
    {
      advice: text.trustAdvice,
      key: 'trust',
      label: text.trust,
      resetLimit: DEFEAT_TRUST_LIMIT,
      value: stats.trust,
    },
  ];
  return warnings.find((warning) => warning.value < STATUS_WARNING_LIMIT && !dismissed.includes(warning.key)) ?? null;
};
const getStatusValue = (stats: CityStats, key: StatusWarning['key']) => {
  if (key === 'happiness') return stats.happiness;
  if (key === 'safety') return stats.safety;
  return stats.trust;
};

const getDestroyedReason = (stats: CityStats, language: Language) => {
  const text = destroyedText[language];
  if (stats.happiness < DEFEAT_HAPPINESS) return text.happiness(stats.happiness);
  if (stats.safety < DEFEAT_SAFETY_LIMIT) return text.safety(stats.safety);
  return null;
};

const statusWarningText: Record<Language, {
  happiness: string;
  happinessAdvice: string;
  safety: string;
  safetyAdvice: string;
  trust: string;
  trustAdvice: string;
}> = {
  ru: {
    happiness: 'Счастье',
    happinessAdvice: 'Построй парк, школу или магазин, а ещё попробуй снизить налог.',
    safety: 'Безопасность',
    safetyAdvice: 'Построй полицию или пожарную часть, чтобы жители чувствовали себя спокойнее.',
    trust: 'Доверие',
    trustAdvice: 'Снизь налог, выполняй квесты и развивай важные службы города.',
  },
  en: {
    happiness: 'Happiness',
    happinessAdvice: 'Build a park, school, or shop, and try lowering taxes.',
    safety: 'Safety',
    safetyAdvice: 'Build police or a fire station so residents feel safer.',
    trust: 'Trust',
    trustAdvice: 'Lower taxes, complete quests, and improve important city services.',
  },
  kk: {
    happiness: 'Бақыт',
    happinessAdvice: 'Саябақ, мектеп немесе дүкен сал, салықты да төмендетіп көр.',
    safety: 'Қауіпсіздік',
    safetyAdvice: 'Тұрғындар тыныш сезінуі үшін полиция немесе өрт сөндіру бөлімін сал.',
    trust: 'Сенім',
    trustAdvice: 'Салықты төмендет, квесттерді орында және маңызды қалалық қызметтерді дамыт.',
  },
};

const destroyedText: Record<Language, { happiness: (value: number) => string; safety: (value: number) => string }> = {
  ru: {
    happiness: (value) => `Счастье упало до ${value}%. Жители больше не поддерживают мэра.`,
    safety: (value) => `Безопасность упала до ${value}%. На улицах стало слишком опасно.`,
  },
  en: {
    happiness: (value) => `Happiness fell to ${value}%. Residents no longer support the mayor.`,
    safety: (value) => `Safety fell to ${value}%. The streets became too dangerous.`,
  },
  kk: {
    happiness: (value) => `Бақыт ${value}%-ға түсті. Тұрғындар әкімді енді қолдамайды.`,
    safety: (value) => `Қауіпсіздік ${value}%-ға түсті. Көшелер тым қауіпті болды.`,
  },
};
export default function App() {
  const { language, t } = useLanguage();
  const [savedGame] = useState(loadSavedCities);
  const [countryId, setCountryId] = useState(savedGame.countryId);
  const [cities, setCities] = useState<Record<string, CityStats>>(savedGame.cities);
  const [screen, setScreen] = useState<'menu' | 'starting' | 'playing'>('menu');
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
  const [isQuestRewardOpen, setIsQuestRewardOpen] = useState(false);
  const [statusWarning, setStatusWarning] = useState<StatusWarning | null>(null);
  const [dismissedStatusWarnings, setDismissedStatusWarnings] = useState<StatusWarning['key'][]>([]);
  const [settings, setSettings] = useState(loadGameSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<MoneyLeaderboardItem[]>([]);
  const stats = cities[countryId] ?? createInitialCity(countryId);
  const destroyedReason = getDestroyedReason(stats, language);
  const viewedStats = friendView ? friendView.cities[friendView.countryId] ?? createInitialCity(friendView.countryId) : stats;
  const eventNotifications = useEventNotifications(stats, screen === 'playing' && !friendView, language);
  const selectedMapQuest = getSelectedQuest(
    selectedQuestId,
    aiQuest,
    stats,
    getQuestStatuses(stats).filter((quest) => !quest.claimed),
    getHourlyQuestStatuses(stats),
  );
  const questMarkers = useMemo(() => {
    const mayor = getQuestStatuses(stats)
      .filter((quest) => !quest.claimed)
      .map((quest) => ({ id: quest.id, kind: 'mayor' as const, title: getQuestTitle(quest, 'mayor', language), completed: quest.completed }));
    const hourly = getHourlyQuestStatuses(stats).map((quest) => ({ id: quest.id, kind: 'hourly' as const, title: getQuestTitle(quest, 'hourly', language), completed: quest.completed }));
    const ai = aiQuest ? [{ id: aiQuest.id, kind: 'ai' as const, title: aiQuest.title, completed: getAiQuestProgress(aiQuest, stats) >= aiQuest.target }] : [];
    return createQuestMapMarkers([...ai, ...hourly, ...mayor]);
  }, [aiQuest, language, stats]);

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
      news: [`Р•Р¶РµРґРЅРµРІРЅР°СЏ РЅР°РіСЂР°РґР°: РґРµРЅСЊ ${result.day}, +$${result.amount.toLocaleString('ru-RU')}.`, ...current.news].slice(0, 7),
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
      news: [`Р‘РµСЃРїР»Р°С‚РЅР°СЏ РЅР°РіСЂР°РґР°: ${result.label}, +$${result.amount.toLocaleString('ru-RU')}.`, ...current.news].slice(0, 7),
    }));
  };

  const handleQuestClaim = (questId: string) => {
    playSound('success');
    updateCity((current) => claimQuestReward(current, questId));
    setSelectedQuestId(null);
    setIsQuestRewardOpen(false);
  };

  const handleHourlyQuestClaim = (questId: string) => {
    playSound('success');
    updateCity((current) => claimHourlyQuestReward(current, questId));
    setSelectedQuestId(null);
    setIsQuestRewardOpen(false);
  };

  const handleGenerateAiQuest = async () => {
    setAiQuestLoading(true);
    try {
      const quest = await generateAiQuest(stats, language);
      playSound('click');
      setAiQuest(quest);
      setSelectedQuestId(quest.id);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'РЅРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР°';
      updateCity((current) => ({
        ...current,
        news: [`РР СЃРµР№С‡Р°СЃ РЅРµ СЃРјРѕРі РїСЂРёРґСѓРјР°С‚СЊ Р·Р°РґР°РЅРёРµ: ${message}`, ...current.news].slice(0, 7),
      }));
    } finally {
      setAiQuestLoading(false);
    }
  };

  const handleAiQuestClaim = async (openNextQuest = true) => {
    if (!aiQuest || getAiQuestProgress(aiQuest, stats) < aiQuest.target) return;
    playSound('success');
    const completedStats = completeAiQuest(stats, aiQuest);
    setAiQuest(null);
    updateCity(() => completedStats);
    if (!openNextQuest) setIsQuestRewardOpen(false);
    setAiQuestLoading(true);
    try {
      const nextQuest = await generateAiQuest(completedStats, language);
      setAiQuest(nextQuest);
      if (openNextQuest) setSelectedQuestId(nextQuest.id);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'РЅРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР°';
      updateCity((current) => ({
        ...current,
        news: [`РР РЅРµ СЃРјРѕРі РїСЂРёРґСѓРјР°С‚СЊ РЅРѕРІС‹Р№ РєРІРµСЃС‚: ${message}`, ...current.news].slice(0, 7),
      }));
    } finally {
      setAiQuestLoading(false);
    }
  };

  const handleQuestMarkerClick = (questId: string) => {
    setSelectedQuestId(questId);
    setIsQuestRewardOpen(true);
  };

  const handleMapQuestClaim = async () => {
    if (!selectedMapQuest?.quest.completed) return;
    if (selectedMapQuest.kind === 'ai') {
      setSelectedQuestId(null);
      await handleAiQuestClaim(false);
      return;
    }
    if (selectedMapQuest.kind === 'hourly') handleHourlyQuestClaim(selectedMapQuest.quest.id);
    if (selectedMapQuest.kind === 'mayor') handleQuestClaim(selectedMapQuest.quest.id);
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

  const handleRestartCity = () => {
    const freshCity = createInitialCity(countryId);
    setCities((current) => ({ ...current, [countryId]: freshCity }));
    setAiQuest(null);
    setSelectedQuestId(null);
    setIsQuestRewardOpen(false);
    setStatusWarning(null);
    setDismissedStatusWarnings([]);
    setFriendView(null);
  };

  const handleSettingsChange = (nextSettings: GameSettings) => {
    setSettings(nextSettings);
    saveGameSettings(nextSettings);
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
    setLeaderboard([]);
    await supabase.auth.signOut();
  };

  const refreshLeaderboard = async () => {
    try {
      setLeaderboard(await loadMoneyLeaderboard());
    } catch (error) {
      console.error(error);
    }
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
      setFriendMessage('РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ РґРѕР±Р°РІРёС‚СЊ РґСЂСѓРіР°. РџСЂРѕРІРµСЂСЊ email РёР»Рё РїРѕРїСЂРѕР±СѓР№ РїРѕР·Р¶Рµ.');
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
      setFriendMessage('Р—Р°СЏРІРєР° РїСЂРёРЅСЏС‚Р°. РўРµРїРµСЂСЊ РјРѕР¶РЅРѕ СЃРјРѕС‚СЂРµС‚СЊ РіРѕСЂРѕРґ РґСЂСѓРіР°.');
    } catch (error) {
      console.error(error);
      setFriendMessage('РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ РїСЂРёРЅСЏС‚СЊ Р·Р°СЏРІРєСѓ. РџРѕРїСЂРѕР±СѓР№ РїРѕР·Р¶Рµ.');
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
        setFriendMessage('РЈ РґСЂСѓРіР° РїРѕРєР° РЅРµС‚ СЃРѕС…СЂР°РЅС‘РЅРЅРѕРіРѕ РіРѕСЂРѕРґР°.');
        return;
      }
      setFriendView({ ...saved, friend });
      setIsFriendsOpen(false);
    } catch (error) {
      console.error(error);
      setFriendMessage('РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ РѕС‚РєСЂС‹С‚СЊ РіРѕСЂРѕРґ РґСЂСѓРіР°. Р’РѕР·РјРѕР¶РЅРѕ, РјРёРіСЂР°С†РёРё РµС‰С‘ РЅРµ РїСЂРёРјРµРЅРµРЅС‹.');
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
        refreshLeaderboard().catch((error: unknown) => console.error(error));
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
      Promise.all([
        saveUserCities(countryId, cities),
        saveMoneyLeaderboard(session, countryId, cities),
      ])
        .then(() => refreshLeaderboard())
        .catch((error: unknown) => console.error(error));
    }, 800);

    return () => window.clearTimeout(timerId);
  }, [cities, cloudReady, countryId, session?.user]);

  useEffect(() => {
    if (screen !== 'playing') return;
    if (destroyedReason) {
      setStatusWarning(null);
      return;
    }
    const warning = getStatusWarning(stats, dismissedStatusWarnings, language);
    setStatusWarning(warning);
    setDismissedStatusWarnings((current) => {
      const next = current.filter((key) => getStatusValue(stats, key) < STATUS_WARNING_LIMIT);
      return next.length === current.length ? current : next;
    });
  }, [destroyedReason, dismissedStatusWarnings, screen, language, stats.happiness, stats.safety, stats.trust]);

  useEffect(() => {
    if (screen !== 'playing') return undefined;
    if (destroyedReason) return undefined;
    const timerId = window.setInterval(() => {
      setPlaytimeReward((current) => addPlaytimeSecond(current));
      setCities((current) => ({
        ...current,
        [countryId]: ensureHourlyQuests(advanceTime(current[countryId] ?? createInitialCity(countryId))),
      }));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [countryId, destroyedReason, screen]);

  useEffect(() => {
    applyAudioSettings(settings);
    document.body.dataset.colorTheme = settings.colorTheme;
    document.body.dataset.deviceMode = settings.deviceMode;
    document.body.dataset.wallpaper = settings.wallpaper;
  }, [settings]);

  return (
    <>
      {screen !== 'playing' && (
        <StartMenu
          authLoading={authLoading}
          deviceMode={settings.deviceMode}
          isSignedIn={Boolean(session?.user)}
          leaving={screen === 'starting'}
          userName={session?.user.email ?? null}
          onDeviceModeChange={(deviceMode) => handleSettingsChange({ ...settings, deviceMode })}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          onStart={handleStart}
        />
      )}
      <main className={`game device-${settings.deviceMode} ${screen === 'playing' ? 'visible' : 'behind-menu'}`}>
        <EventNotifications notifications={eventNotifications.notifications} onDismiss={eventNotifications.dismissNotification} />
        <YouTubeMusicPlayer url={settings.youtubeMusicUrl} />
        {destroyedReason && <CityDestroyedOverlay reason={destroyedReason} onRestart={handleRestartCity} />}
        {selectedMapQuest && isQuestRewardOpen && !destroyedReason && !friendView && (
          <QuestRewardModal
            selected={selectedMapQuest}
            onClaim={handleMapQuestClaim}
            onClose={() => setIsQuestRewardOpen(false)}
          />
        )}
        {statusWarning && (
          <HappinessWarning
            advice={statusWarning.advice}
            label={statusWarning.label}
            resetLimit={statusWarning.resetLimit}
            value={statusWarning.value}
            onClose={() => {
              setDismissedStatusWarnings((current) => (
                current.includes(statusWarning.key) ? current : [...current, statusWarning.key]
              ));
              setStatusWarning(null);
            }}
          />
        )}
        <CityHeader
          friendCount={friends.filter((friend) => friend.status === 'accepted').length}
          stats={viewedStats}
          onOpenFriends={() => setIsFriendsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        {isSettingsOpen && (
          <SettingsPanel
            settings={settings}
            onChange={handleSettingsChange}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
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
              onQuestMarkerClick={handleQuestMarkerClick}
              onMoveBuilding={handleMoveBuilding}
              onRotateBuilding={handleRotateBuilding}
            />
            {!friendView && (
              <IncidentPanel
                stats={stats}
                responders={responders}
                onRespondersChange={setResponders}
                onResolve={handleResolve}
              />
            )}
          </div>
          <div className="right">
            {!friendView && <BuildPanel stats={stats} onBuild={handleBuild} />}
            {!friendView && <AiAdvisorPanel stats={stats} />}
            {!friendView && (
              <MoneyLeaderboardPanel
                currentUserId={session?.user.id ?? null}
                items={leaderboard}
              />
            )}
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
        {!friendView && <MobileQuickNav />}
      </main>
    </>
  );
}
