// ===================================
// UI Translations
// ===================================
// Static UI strings used throughout the website

import { LocalizedString } from './types'

type TranslationKeys = {
  // Navigation
  nav: {
    home: LocalizedString
    about: LocalizedString
    stoneSurfaces: LocalizedString
    furniture: LocalizedString
    projects: LocalizedString
    fullService: LocalizedString
    contact: LocalizedString
  }
  // Stone materials
  materials: {
    silestone: LocalizedString
    dekton: LocalizedString
    granite: LocalizedString
    marble: LocalizedString
  }
  // Furniture categories
  furnitureCategories: {
    kitchens: LocalizedString
    builtIn: LocalizedString
    interiorProjects: LocalizedString
  }
  // Common UI elements
  common: {
    readMore: LocalizedString
    viewAll: LocalizedString
    viewProject: LocalizedString
    contactUs: LocalizedString
    learnMore: LocalizedString
    getQuote: LocalizedString
    send: LocalizedString
    sending: LocalizedString
    messageSent: LocalizedString
    error: LocalizedString
    filters: LocalizedString
    all: LocalizedString
  }
  // Contact form
  contactForm: {
    name: LocalizedString
    email: LocalizedString
    phone: LocalizedString
    message: LocalizedString
    namePlaceholder: LocalizedString
    emailPlaceholder: LocalizedString
    phonePlaceholder: LocalizedString
    messagePlaceholder: LocalizedString
  }
  // Footer
  footer: {
    companyInfo: LocalizedString
    quickLinks: LocalizedString
    stoneProducts: LocalizedString
    furnitureProducts: LocalizedString
    rights: LocalizedString
  }
  // Project filters
  projectFilters: {
    type: LocalizedString
    use: LocalizedString
    stone: LocalizedString
    furniture: LocalizedString
    kitchen: LocalizedString
    bathroom: LocalizedString
    commercial: LocalizedString
    residential: LocalizedString
  }
}

export const translations: TranslationKeys = {
  nav: {
    home: {
      lv: 'Sākums',
      en: 'Home',
      ru: 'Главная',
    },
    about: {
      lv: 'Par mums',
      en: 'About Us',
      ru: 'О нас',
    },
    stoneSurfaces: {
      lv: 'Akmens virsmas',
      en: 'Stone Surfaces',
      ru: 'Каменные поверхности',
    },
    furniture: {
      lv: 'Mēbeles',
      en: 'Furniture',
      ru: 'Мебель',
    },
    projects: {
      lv: 'Projekti',
      en: 'Projects',
      ru: 'Проекты',
    },
    fullService: {
      lv: 'Pilns serviss',
      en: 'Full Service',
      ru: 'Полный сервис',
    },
    contact: {
      lv: 'Kontakti',
      en: 'Contact',
      ru: 'Контакты',
    },
  },
  materials: {
    silestone: {
      lv: 'Silestone',
      en: 'Silestone',
      ru: 'Silestone',
    },
    dekton: {
      lv: 'Dekton',
      en: 'Dekton',
      ru: 'Dekton',
    },
    granite: {
      lv: 'Granīts',
      en: 'Granite',
      ru: 'Гранит',
    },
    marble: {
      lv: 'Marmors',
      en: 'Marble',
      ru: 'Мрамор',
    },
  },
  furnitureCategories: {
    kitchens: {
      lv: 'Virtuves mēbeles',
      en: 'Kitchen Furniture',
      ru: 'Кухонная мебель',
    },
    builtIn: {
      lv: 'Iebūvējamās mēbeles',
      en: 'Built-in Furniture',
      ru: 'Встроенная мебель',
    },
    interiorProjects: {
      lv: 'Interjera projekti',
      en: 'Interior Projects',
      ru: 'Интерьерные проекты',
    },
  },
  common: {
    readMore: {
      lv: 'Lasīt vairāk',
      en: 'Read More',
      ru: 'Читать далее',
    },
    viewAll: {
      lv: 'Skatīt visus',
      en: 'View All',
      ru: 'Смотреть все',
    },
    viewProject: {
      lv: 'Skatīt projektu',
      en: 'View Project',
      ru: 'Смотреть проект',
    },
    contactUs: {
      lv: 'Sazināties',
      en: 'Contact Us',
      ru: 'Связаться',
    },
    learnMore: {
      lv: 'Uzzināt vairāk',
      en: 'Learn More',
      ru: 'Узнать больше',
    },
    getQuote: {
      lv: 'Pieprasīt cenu',
      en: 'Get a Quote',
      ru: 'Запросить цену',
    },
    send: {
      lv: 'Nosūtīt',
      en: 'Send',
      ru: 'Отправить',
    },
    sending: {
      lv: 'Sūta...',
      en: 'Sending...',
      ru: 'Отправка...',
    },
    messageSent: {
      lv: 'Ziņa nosūtīta!',
      en: 'Message sent!',
      ru: 'Сообщение отправлено!',
    },
    error: {
      lv: 'Kļūda. Lūdzu, mēģiniet vēlreiz.',
      en: 'Error. Please try again.',
      ru: 'Ошибка. Пожалуйста, попробуйте снова.',
    },
    filters: {
      lv: 'Filtri',
      en: 'Filters',
      ru: 'Фильтры',
    },
    all: {
      lv: 'Visi',
      en: 'All',
      ru: 'Все',
    },
  },
  contactForm: {
    name: {
      lv: 'Vārds',
      en: 'Name',
      ru: 'Имя',
    },
    email: {
      lv: 'E-pasts',
      en: 'Email',
      ru: 'Email',
    },
    phone: {
      lv: 'Tālrunis',
      en: 'Phone',
      ru: 'Телефон',
    },
    message: {
      lv: 'Ziņa',
      en: 'Message',
      ru: 'Сообщение',
    },
    namePlaceholder: {
      lv: 'Jūsu vārds',
      en: 'Your name',
      ru: 'Ваше имя',
    },
    emailPlaceholder: {
      lv: 'jusu@epasts.lv',
      en: 'your@email.com',
      ru: 'ваш@email.ru',
    },
    phonePlaceholder: {
      lv: '+371 20000000',
      en: '+371 20000000',
      ru: '+371 20000000',
    },
    messagePlaceholder: {
      lv: 'Jūsu ziņa...',
      en: 'Your message...',
      ru: 'Ваше сообщение...',
    },
  },
  footer: {
    companyInfo: {
      lv: 'Uzņēmuma informācija',
      en: 'Company Information',
      ru: 'Информация о компании',
    },
    quickLinks: {
      lv: 'Ātrās saites',
      en: 'Quick Links',
      ru: 'Быстрые ссылки',
    },
    stoneProducts: {
      lv: 'Akmens produkti',
      en: 'Stone Products',
      ru: 'Каменные изделия',
    },
    furnitureProducts: {
      lv: 'Mēbeles',
      en: 'Furniture',
      ru: 'Мебель',
    },
    rights: {
      lv: 'Visas tiesības aizsargātas.',
      en: 'All rights reserved.',
      ru: 'Все права защищены.',
    },
  },
  projectFilters: {
    type: {
      lv: 'Tips',
      en: 'Type',
      ru: 'Тип',
    },
    use: {
      lv: 'Lietojums',
      en: 'Use',
      ru: 'Использование',
    },
    stone: {
      lv: 'Akmens',
      en: 'Stone',
      ru: 'Камень',
    },
    furniture: {
      lv: 'Mēbeles',
      en: 'Furniture',
      ru: 'Мебель',
    },
    kitchen: {
      lv: 'Virtuve',
      en: 'Kitchen',
      ru: 'Кухня',
    },
    bathroom: {
      lv: 'Vannas istaba',
      en: 'Bathroom',
      ru: 'Ванная',
    },
    commercial: {
      lv: 'Komerciāls',
      en: 'Commercial',
      ru: 'Коммерческий',
    },
    residential: {
      lv: 'Dzīvojamais',
      en: 'Residential',
      ru: 'Жилой',
    },
  },
}

