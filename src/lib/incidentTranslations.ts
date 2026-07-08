import type { Incident } from './gameTypes';
import type { Language } from './i18n';

type IncidentText = {
  report: string;
  source: string;
  title: string;
  truth: string;
};

export const getIncidentText = (incident: Incident, language: Language): IncidentText => {
  return incidentText[incident.kind]?.[language] ?? {
    report: incident.report,
    source: incident.source,
    title: incident.title,
    truth: incident.truth,
  };
};

const incidentText: Record<Incident['kind'], Record<Language, IncidentText>> = {
  chase: {
    en: {
      report: 'A patrol spotted an offender car. It is driving on the road and refuses to stop.',
      source: 'police',
      title: 'Chase on the city road',
      truth: 'Police are needed: the offender can be stopped if a patrol is sent quickly.',
    },
    ru: {
      report: 'Патруль заметил машину нарушителя. Она едет по дороге и не останавливается.',
      source: 'полиция',
      title: 'Погоня на городской дороге',
      truth: 'Нужна полиция: нарушителя можно остановить, если быстро отправить экипаж.',
    },
    kk: {
      report: 'Патруль тәртіп бұзушының көлігін байқады. Ол жолмен кетіп барады және тоқтамайды.',
      source: 'полиция',
      title: 'Қала жолындағы қуғын',
      truth: 'Полиция керек: экипаж тез жіберілсе, тәртіп бұзушыны тоқтатуға болады.',
    },
  },
  crime: {
    en: {
      report: 'An abandoned bag was noticed on the station platform. The threat must be checked.',
      source: 'station cameras',
      title: 'Suspicious bag at the station',
      truth: 'The bag is truly suspicious, and the station area must be sealed quickly.',
    },
    ru: {
      report: 'На платформе вокзала заметили оставленную сумку. Нужно проверить угрозу.',
      source: 'камеры вокзала',
      title: 'Подозрительная сумка на вокзале',
      truth: 'Сумка действительно подозрительная, район вокзала нужно быстро оцепить.',
    },
    kk: {
      report: 'Вокзал платформасында қалдырылған сөмке байқалды. Қауіпті тексеру керек.',
      source: 'вокзал камералары',
      title: 'Вокзалдағы күдікті сөмке',
      truth: 'Сөмке шынымен күдікті, вокзал ауданын тез қоршау керек.',
    },
  },
  epidemic: {
    en: {
      report: 'News reports a possible epidemic. The scale is still unknown.',
      source: 'media',
      title: 'Disease outbreak',
      truth: 'Several districts are sick, and fast medical help is needed.',
    },
    ru: {
      report: 'Новости пишут об эпидемии. Масштаб пока неизвестен.',
      source: 'СМИ',
      title: 'Вспышка болезни',
      truth: 'Заболели несколько районов, нужна быстрая медицина.',
    },
    kk: {
      report: 'Жаңалықтар індет туралы жазып жатыр. Ауқымы әзірге белгісіз.',
      source: 'БАҚ',
      title: 'Аурудың өршуі',
      truth: 'Бірнеше аудан ауырды, жедел медицина керек.',
    },
  },
  fire: {
    en: {
      report: 'A witness says a whole block is burning. There is not much data yet.',
      source: 'resident call',
      title: 'Fire in a residential district',
      truth: 'One house is burning, but the fire may spread further.',
    },
    ru: {
      report: 'Очевидец говорит, что горит целый квартал. Данных мало.',
      source: 'звонок жителя',
      title: 'Пожар в жилом районе',
      truth: 'Горит один дом, но огонь может перейти дальше.',
    },
    kk: {
      report: 'Куәгер тұтас квартал жанып жатыр дейді. Мәлімет аз.',
      source: 'тұрғын қоңырауы',
      title: 'Тұрғын аудандағы өрт',
      truth: 'Бір үй жанып жатыр, бірақ өрт әрі қарай таралуы мүмкін.',
    },
  },
  flood: {
    en: {
      report: 'Water is rising near the road. Residents may need evacuation.',
      source: 'rescuers',
      title: 'Flooding near the district',
      truth: 'The flooding is real, and rescuers should secure the area.',
    },
    ru: {
      report: 'Вода поднимается рядом с дорогой. Жителям может понадобиться эвакуация.',
      source: 'спасатели',
      title: 'Подтопление района',
      truth: 'Подтопление настоящее, спасателям нужно обезопасить район.',
    },
    kk: {
      report: 'Жол маңында су көтеріліп жатыр. Тұрғындарды көшіру қажет болуы мүмкін.',
      source: 'құтқарушылар',
      title: 'Ауданды су басу қаупі',
      truth: 'Су басу қаупі шынайы, құтқарушылар ауданды қауіпсіздендіруі керек.',
    },
  },
  protest: {
    en: {
      report: 'People demand lower taxes and a solution to housing problems.',
      source: 'police',
      title: 'City protest',
      truth: 'The protest is peaceful, but it can grow into a mass event.',
    },
    ru: {
      report: 'Люди требуют снизить налоги и решить проблему жилья.',
      source: 'полиция',
      title: 'Городской протест',
      truth: 'Протест мирный, но может стать массовым.',
    },
    kk: {
      report: 'Адамдар салықты төмендетуді және тұрғын үй мәселесін шешуді талап етеді.',
      source: 'полиция',
      title: 'Қалалық наразылық',
      truth: 'Наразылық бейбіт, бірақ жаппай оқиғаға айналуы мүмкін.',
    },
  },
  robots: {
    en: {
      report: 'Delivery robots are stopping and blocking roads.',
      source: 'informant',
      title: 'Robotic network failure',
      truth: 'The failure is real, but it can be localized.',
    },
    ru: {
      report: 'Роботы доставки останавливаются и блокируют дороги.',
      source: 'информатор',
      title: 'Сбой роботизированной сети',
      truth: 'Сбой настоящий, но его можно локализовать.',
    },
    kk: {
      report: 'Жеткізу роботтары тоқтап, жолдарды жауып жатыр.',
      source: 'ақпарат беруші',
      title: 'Роботтандырылған желі ақауы',
      truth: 'Ақау шынайы, бірақ оны оқшаулауға болады.',
    },
  },
  terror: {
    en: {
      report: 'Alarming messages came from the city center. The scale of the threat is being clarified.',
      source: 'police',
      title: 'Terror threat in the city center',
      truth: 'The threat was real, but some online rumors were false.',
    },
    ru: {
      report: 'Поступили тревожные сообщения из центра. Масштаб угрозы уточняется.',
      source: 'полиция',
      title: 'Теракт в центре города',
      truth: 'Угроза была настоящей, но часть слухов в сети оказалась ложной.',
    },
    kk: {
      report: 'Орталықтан алаңдатарлық хабарлар келді. Қауіп ауқымы нақтыланып жатыр.',
      source: 'полиция',
      title: 'Қала орталығындағы террор қаупі',
      truth: 'Қауіп шынайы болды, бірақ желідегі кейбір қауесет жалған шықты.',
    },
  },
};
