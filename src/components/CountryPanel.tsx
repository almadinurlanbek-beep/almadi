import { countries, getCountry } from '../lib/countries';
import type { CityStats, CountryClimate } from '../lib/gameTypes';
import { useLanguage, type Language } from '../lib/i18n';

type Props = {
  stats: CityStats;
  onCountryChange: (countryId: string) => void;
};

export function CountryPanel({ stats, onCountryChange }: Props) {
  const { language, t } = useLanguage();
  const country = getCountry(stats.countryId);
  const currentText = countryText[language][country.id] ?? { name: country.name, ruler: country.rulerTitle };

  return (
    <section className="panel country-panel">
      <label>
        <span className="eyebrow">{t('country')}</span>
        <select value={stats.countryId} onChange={(event) => onCountryChange(event.target.value)}>
          {countries.map((item) => (
            <option key={item.id} value={item.id}>
              {countryText[language][item.id]?.name ?? item.name}
            </option>
          ))}
        </select>
      </label>
      <div>
        <small>{t('countryPopulation')}</small>
        <strong>{stats.countryPopulation.toLocaleString(language === 'en' ? 'en-US' : 'ru-RU')}</strong>
      </div>
      <div>
        <small>{rulerLabel[language]}</small>
        <strong>{currentText.ruler}</strong>
      </div>
      <div>
        <small>{climateLabel[language]}</small>
        <strong>{climateText[language][country.climate]}</strong>
      </div>
    </section>
  );
}

const rulerLabel: Record<Language, string> = {
  en: 'Ruler',
  ru: 'Правитель',
  kk: 'Басшы',
};

const climateLabel: Record<Language, string> = {
  en: 'Climate',
  ru: 'Климат',
  kk: 'Климат',
};

const climateText: Record<Language, Record<CountryClimate, string>> = {
  en: {
    alpine: 'Mountains and bamboo highlands',
    'coastal-desert': 'Coastal desert',
    'desert-oasis': 'Desert and oasis',
    islands: 'Islands and coast',
    mediterranean: 'Hills and vineyards',
    monsoon: 'Monsoon greenery',
    'northern-fjords': 'Fjords and cliffs',
    savanna: 'Savanna',
    'steppe-mountains': 'Steppe and mountains',
    'taiga-snow': 'Taiga and snow',
    'temperate-forest': 'Forests and fields',
    'tropical-forest': 'Tropical forest',
  },
  ru: {
    alpine: 'Горы и высокогорья',
    'coastal-desert': 'Побережье и пустыня',
    'desert-oasis': 'Пустыня и оазис',
    islands: 'Острова и побережье',
    mediterranean: 'Холмы и виноградники',
    monsoon: 'Муссонная зелень',
    'northern-fjords': 'Фьорды и скалы',
    savanna: 'Саванна',
    'steppe-mountains': 'Степи и горы',
    'taiga-snow': 'Тайга и снег',
    'temperate-forest': 'Леса и поля',
    'tropical-forest': 'Тропический лес',
  },
  kk: {
    alpine: 'Таулар мен биік аймақтар',
    'coastal-desert': 'Жағалау және шөл',
    'desert-oasis': 'Шөл және оазис',
    islands: 'Аралдар және жағалау',
    mediterranean: 'Төбелер мен жүзімдіктер',
    monsoon: 'Муссон жасылдығы',
    'northern-fjords': 'Фьордтар мен жартастар',
    savanna: 'Саванна',
    'steppe-mountains': 'Дала және таулар',
    'taiga-snow': 'Тайга және қар',
    'temperate-forest': 'Ормандар мен алқаптар',
    'tropical-forest': 'Тропикалық орман',
  },
};

const countryText: Record<Language, Record<string, { name: string; ruler: string }>> = {
  en: {
    australia: { name: 'Australia', ruler: 'Prime Minister' },
    brazil: { name: 'Brazil', ruler: 'President' },
    canada: { name: 'Canada', ruler: 'Prime Minister' },
    china: { name: 'China', ruler: 'Chairman' },
    egypt: { name: 'Egypt', ruler: 'President' },
    france: { name: 'France', ruler: 'President' },
    germany: { name: 'Germany', ruler: 'Chancellor' },
    india: { name: 'India', ruler: 'Prime Minister' },
    japan: { name: 'Japan', ruler: 'Emperor' },
    kazakhstan: { name: 'Kazakhstan', ruler: 'Akim' },
    norway: { name: 'Norway', ruler: 'King' },
    russia: { name: 'Russia', ruler: 'Tsar' },
    uae: { name: 'UAE', ruler: 'Sheikh' },
    usa: { name: 'USA', ruler: 'President' },
    uzbekistan: { name: 'Uzbekistan', ruler: 'Hokim' },
  },
  ru: {
    australia: { name: 'Австралия', ruler: 'Премьер-министр' },
    brazil: { name: 'Бразилия', ruler: 'Президент' },
    canada: { name: 'Канада', ruler: 'Премьер-министр' },
    china: { name: 'Китай', ruler: 'Председатель' },
    egypt: { name: 'Египет', ruler: 'Президент' },
    france: { name: 'Франция', ruler: 'Президент' },
    germany: { name: 'Германия', ruler: 'Канцлер' },
    india: { name: 'Индия', ruler: 'Премьер-министр' },
    japan: { name: 'Япония', ruler: 'Император' },
    kazakhstan: { name: 'Казахстан', ruler: 'Аким' },
    norway: { name: 'Норвегия', ruler: 'Король' },
    russia: { name: 'Россия', ruler: 'Царь' },
    uae: { name: 'ОАЭ', ruler: 'Шейх' },
    usa: { name: 'США', ruler: 'Президент' },
    uzbekistan: { name: 'Узбекистан', ruler: 'Хоким' },
  },
  kk: {
    australia: { name: 'Аустралия', ruler: 'Премьер-министр' },
    brazil: { name: 'Бразилия', ruler: 'Президент' },
    canada: { name: 'Канада', ruler: 'Премьер-министр' },
    china: { name: 'Қытай', ruler: 'Төраға' },
    egypt: { name: 'Мысыр', ruler: 'Президент' },
    france: { name: 'Франция', ruler: 'Президент' },
    germany: { name: 'Германия', ruler: 'Канцлер' },
    india: { name: 'Үндістан', ruler: 'Премьер-министр' },
    japan: { name: 'Жапония', ruler: 'Император' },
    kazakhstan: { name: 'Қазақстан', ruler: 'Әкім' },
    norway: { name: 'Норвегия', ruler: 'Король' },
    russia: { name: 'Ресей', ruler: 'Патша' },
    uae: { name: 'БАӘ', ruler: 'Шейх' },
    usa: { name: 'АҚШ', ruler: 'Президент' },
    uzbekistan: { name: 'Өзбекстан', ruler: 'Хоким' },
  },
};
