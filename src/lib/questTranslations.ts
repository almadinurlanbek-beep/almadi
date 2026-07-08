import type { Language } from './i18n';
import type { SelectedQuestCard, SelectedQuestKind } from './questSelection';

type QuestText = {
  description: string;
  rewardBuildingName?: string;
  title: string;
};

const mayorQuestText: Record<string, Record<Language, QuestText>> = {
  'first-neighborhood': {
    en: { title: 'First neighborhood', description: 'Build 5 homes' },
    ru: { title: 'Первый район', description: 'Построй 5 домов' },
    kk: { title: 'Алғашқы аудан', description: '5 үй сал' },
  },
  'safe-streets': {
    en: { title: 'Safe streets', description: 'Raise safety to 70%' },
    ru: { title: 'Безопасные улицы', description: 'Подними безопасность до 70%' },
    kk: { title: 'Қауіпсіз көшелер', description: 'Қауіпсіздікті 70%-ға жеткіз' },
  },
  'university-dream': {
    en: { title: 'University city', description: 'Build 5 schools', rewardBuildingName: 'University' },
    ru: { title: 'Университетский город', description: 'Построй 5 школ', rewardBuildingName: 'Университет' },
    kk: { title: 'Университет қаласы', description: '5 мектеп сал', rewardBuildingName: 'Университет' },
  },
  'green-city': {
    en: { title: 'Green city', description: 'Build 3 parks' },
    ru: { title: 'Зелёный город', description: 'Построй 3 парка' },
    kk: { title: 'Жасыл қала', description: '3 саябақ сал' },
  },
  'business-center': {
    en: { title: 'Business center', description: 'Build 10 shops', rewardBuildingName: 'Bank' },
    ru: { title: 'Бизнес-центр', description: 'Построй 10 магазинов', rewardBuildingName: 'Банк' },
    kk: { title: 'Бизнес орталығы', description: '10 дүкен сал', rewardBuildingName: 'Банк' },
  },
  'big-city': {
    en: { title: 'Big city', description: 'Reach 3000 population', rewardBuildingName: 'Stadium' },
    ru: { title: 'Большой город', description: 'Доведи население до 3000', rewardBuildingName: 'Стадион' },
    kk: { title: 'Үлкен қала', description: 'Халық санын 3000-ға жеткіз', rewardBuildingName: 'Стадион' },
  },
  'sea-gate': {
    en: { title: 'Sea gate', description: 'Build 2 airports and 2 stations', rewardBuildingName: 'Port with ships' },
    ru: { title: 'Морские ворота', description: 'Построй 2 аэропорта и 2 вокзала', rewardBuildingName: 'Порт с кораблями' },
    kk: { title: 'Теңіз қақпасы', description: '2 әуежай және 2 вокзал сал', rewardBuildingName: 'Кемелері бар порт' },
  },
  'culture-capital': {
    en: { title: 'Culture capital', description: 'Raise trust to 65%', rewardBuildingName: 'Museum' },
    ru: { title: 'Культурная столица', description: 'Доведи доверие до 65%', rewardBuildingName: 'Музей' },
    kk: { title: 'Мәдени астана', description: 'Сенімді 65%-ға жеткіз', rewardBuildingName: 'Музей' },
  },
};

const hourlyQuestText: Record<string, Record<Language, (target: number) => QuestText>> = {
  happiness: {
    en: (target) => ({ title: 'Happy residents', description: `Raise happiness to ${target}%` }),
    ru: (target) => ({ title: 'Довольные жители', description: `Подними счастье до ${target}%` }),
    kk: (target) => ({ title: 'Бақытты тұрғындар', description: `Бақытты ${target}%-ға жеткіз` }),
  },
  health: {
    en: (target) => ({ title: 'Healthy city', description: `Raise health to ${target}%` }),
    ru: (target) => ({ title: 'Здоровый город', description: `Подними здоровье до ${target}%` }),
    kk: (target) => ({ title: 'Дені сау қала', description: `Денсаулықты ${target}%-ға жеткіз` }),
  },
  homes: {
    en: (target) => ({ title: 'New homes', description: `Build ${target} homes` }),
    ru: (target) => ({ title: 'Новые дома', description: `Построй ${target} домов` }),
    kk: (target) => ({ title: 'Жаңа үйлер', description: `${target} үй сал` }),
  },
  parks: {
    en: (target) => ({ title: 'More green space', description: `Build ${target} parks` }),
    ru: (target) => ({ title: 'Больше зелени', description: `Построй ${target} парков` }),
    kk: (target) => ({ title: 'Көбірек жасыл аймақ', description: `${target} саябақ сал` }),
  },
  population: {
    en: (target) => ({ title: 'District growth', description: `Reach ${target} population` }),
    ru: (target) => ({ title: 'Рост района', description: `Доведи население до ${target}` }),
    kk: (target) => ({ title: 'Аудан өсімі', description: `Халық санын ${target}-ға жеткіз` }),
  },
  safety: {
    en: (target) => ({ title: 'Calm streets', description: `Raise safety to ${target}%` }),
    ru: (target) => ({ title: 'Спокойные улицы', description: `Подними безопасность до ${target}%` }),
    kk: (target) => ({ title: 'Тыныш көшелер', description: `Қауіпсіздікті ${target}%-ға жеткіз` }),
  },
  schools: {
    en: (target) => ({ title: 'School district', description: `Build ${target} schools` }),
    ru: (target) => ({ title: 'Школьный квартал', description: `Построй ${target} школ` }),
    kk: (target) => ({ title: 'Мектеп ауданы', description: `${target} мектеп сал` }),
  },
  shops: {
    en: (target) => ({ title: 'Local business', description: `Build ${target} shops` }),
    ru: (target) => ({ title: 'Местный бизнес', description: `Построй ${target} магазинов` }),
    kk: (target) => ({ title: 'Жергілікті бизнес', description: `${target} дүкен сал` }),
  },
  trust: {
    en: (target) => ({ title: 'Mayor trust', description: `Raise trust to ${target}%` }),
    ru: (target) => ({ title: 'Доверие мэру', description: `Подними доверие до ${target}%` }),
    kk: (target) => ({ title: 'Әкімге сенім', description: `Сенімді ${target}%-ға жеткіз` }),
  },
};

export const translateQuest = (quest: SelectedQuestCard, kind: SelectedQuestKind, language: Language): SelectedQuestCard => {
  const text = getQuestText(quest, kind, language);
  return text ? { ...quest, ...text } : quest;
};

export const getQuestTitle = (quest: Pick<SelectedQuestCard, 'id' | 'target' | 'title'>, kind: SelectedQuestKind, language: Language) => {
  return getQuestText(quest, kind, language)?.title ?? quest.title;
};

const getQuestText = (quest: Pick<SelectedQuestCard, 'id' | 'target'>, kind: SelectedQuestKind, language: Language): QuestText | null => {
  if (kind === 'mayor') return mayorQuestText[quest.id]?.[language] ?? null;
  if (kind !== 'hourly') return null;
  const parts = quest.id.split('-');
  const objective = parts[parts.length - 1];
  if (!objective) return null;
  return hourlyQuestText[objective]?.[language](quest.target) ?? null;
};
