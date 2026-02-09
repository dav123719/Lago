// ===================================
// Furniture Content Data
// ===================================
// Custom furniture types with localized content

import { FurnitureType } from './types'

const placeholder = (name: string) => `/images/furniture/${name}.jpg`

export const furnitureTypes: FurnitureType[] = [
  // Kitchen furniture
  {
    id: 'kitchens',
    slug: {
      lv: 'virtuves',
      en: 'kitchens',
      ru: 'kuhni',
    },
    name: {
      lv: 'Virtuves mēbeles',
      en: 'Kitchen Furniture',
      ru: 'Кухонная мебель',
    },
    category: 'kitchens',
    description: {
      lv: 'Individuāli projektētas virtuves mēbeles, kas apvieno funkcionalitāti ar estētiku.',
      en: 'Custom-designed kitchen furniture that combines functionality with aesthetics.',
      ru: 'Индивидуально спроектированная кухонная мебель, сочетающая функциональность с эстетикой.',
    },
    longDescription: {
      lv: `Virtuve ir mājas sirds, un mēs saprotam, cik svarīgi ir radīt funkcionālu un skaistu telpu. Mūsu virtuves mēbeles tiek projektētas individuāli, ņemot vērā jūsu vajadzības un telpas īpatnības.

Mēs piedāvājam:
• Pilnīgi individuālu projektēšanu
• Augstas kvalitātes materiālus no vadošajiem Eiropas ražotājiem
• Integrētu akmens virsmu risinājumus
• Modernākās furnitūras un mehānismu risinājumus
• Profesionālu uzstādīšanu`,
      en: `The kitchen is the heart of the home, and we understand how important it is to create a functional and beautiful space. Our kitchen furniture is designed individually, taking into account your needs and space characteristics.

We offer:
• Fully customized design
• High-quality materials from leading European manufacturers
• Integrated stone surface solutions
• The latest hardware and mechanism solutions
• Professional installation`,
      ru: `Кухня — это сердце дома, и мы понимаем, как важно создать функциональное и красивое пространство. Наша кухонная мебель проектируется индивидуально с учетом ваших потребностей и особенностей помещения.

Мы предлагаем:
• Полностью индивидуальное проектирование
• Высококачественные материалы от ведущих европейских производителей
• Интегрированные решения каменных поверхностей
• Новейшие решения фурнитуры и механизмов
• Профессиональный монтаж`,
    },
    features: [
      {
        lv: 'Individuāla projektēšana',
        en: 'Custom design',
        ru: 'Индивидуальное проектирование',
      },
      {
        lv: 'Premium materiāli',
        en: 'Premium materials',
        ru: 'Премиальные материалы',
      },
      {
        lv: 'Integrētas akmens virsmas',
        en: 'Integrated stone surfaces',
        ru: 'Интегрированные каменные поверхности',
      },
      {
        lv: 'Mūsdienīga furnitūra',
        en: 'Modern hardware',
        ru: 'Современная фурнитура',
      },
    ],
    solutions: [
      {
        lv: 'Klasiskās virtuves',
        en: 'Classic kitchens',
        ru: 'Классические кухни',
      },
      {
        lv: 'Modernās virtuves',
        en: 'Modern kitchens',
        ru: 'Современные кухни',
      },
      {
        lv: 'Virtuves ar salu',
        en: 'Island kitchens',
        ru: 'Кухни с островом',
      },
      {
        lv: 'Kompaktās virtuves',
        en: 'Compact kitchens',
        ru: 'Компактные кухни',
      },
    ],
    heroImage: placeholder('kitchen-hero'),
    galleryImages: [
      placeholder('kitchen-1'),
      placeholder('kitchen-2'),
      placeholder('kitchen-3'),
      placeholder('kitchen-4'),
    ],
  },

  // Built-in furniture
  {
    id: 'built-in',
    slug: {
      lv: 'iebuvetajas',
      en: 'built-in',
      ru: 'vstroennaya',
    },
    name: {
      lv: 'Iebūvējamās mēbeles',
      en: 'Built-in Furniture',
      ru: 'Встроенная мебель',
    },
    category: 'built-in',
    description: {
      lv: 'Iebūvējamās mēbeles optimālam telpas izmantojumam.',
      en: 'Built-in furniture for optimal space utilization.',
      ru: 'Встроенная мебель для оптимального использования пространства.',
    },
    longDescription: {
      lv: `Iebūvējamās mēbeles ir ideāls risinājums, lai maksimāli efektīvi izmantotu pieejamo telpu. Mūsu speciālisti izstrādā risinājumus, kas perfekti iekļaujas jūsu interjerā.

Mēs projektējam un izgatavojam:
• Iebūvētos skapjus
• Garderobes sistēmas
• Grāmatplauktus un sienas sistēmas
• Mēbeles ar slīpiem griestiem
• Nišu mēbeles`,
      en: `Built-in furniture is the ideal solution for maximizing available space. Our specialists develop solutions that fit perfectly into your interior.

We design and manufacture:
• Built-in wardrobes
• Walk-in closet systems
• Bookshelves and wall systems
• Furniture for sloped ceilings
• Niche furniture`,
      ru: `Встроенная мебель — идеальное решение для максимально эффективного использования доступного пространства. Наши специалисты разрабатывают решения, которые идеально вписываются в ваш интерьер.

Мы проектируем и изготавливаем:
• Встроенные шкафы
• Гардеробные системы
• Книжные полки и стеновые системы
• Мебель для наклонных потолков
• Мебель для ниш`,
    },
    features: [
      {
        lv: 'Maksimāla telpas izmantošana',
        en: 'Maximum space utilization',
        ru: 'Максимальное использование пространства',
      },
      {
        lv: 'Pielāgots jebkurai formai',
        en: 'Adapted to any shape',
        ru: 'Адаптируется к любой форме',
      },
      {
        lv: 'Harmoniska integrācija interjerā',
        en: 'Harmonious interior integration',
        ru: 'Гармоничная интеграция в интерьер',
      },
      {
        lv: 'Individuāla funkcionalitāte',
        en: 'Individual functionality',
        ru: 'Индивидуальная функциональность',
      },
    ],
    solutions: [
      {
        lv: 'Guļamistabu skapji',
        en: 'Bedroom wardrobes',
        ru: 'Шкафы для спальни',
      },
      {
        lv: 'Garderobes telpas',
        en: 'Walk-in closets',
        ru: 'Гардеробные',
      },
      {
        lv: 'Priekštelpas mēbeles',
        en: 'Hallway furniture',
        ru: 'Мебель для прихожей',
      },
      {
        lv: 'Darba kabineti',
        en: 'Home offices',
        ru: 'Домашние кабинеты',
      },
    ],
    heroImage: placeholder('built-in-hero'),
    galleryImages: [
      placeholder('built-in-1'),
      placeholder('built-in-2'),
      placeholder('built-in-3'),
    ],
  },

  // Interior projects
  {
    id: 'interior-projects',
    slug: {
      lv: 'interjera-projekti',
      en: 'interior-projects',
      ru: 'interiernye-proekty',
    },
    name: {
      lv: 'Interjera projekti',
      en: 'Interior Projects',
      ru: 'Интерьерные проекты',
    },
    category: 'interior-projects',
    description: {
      lv: 'Kompleksi interjera mēbeļu risinājumi jūsu projektam.',
      en: 'Comprehensive interior furniture solutions for your project.',
      ru: 'Комплексные интерьерные мебельные решения для вашего проекта.',
    },
    longDescription: {
      lv: `Mēs realizējam kompleksus interjera projektus, kuros mēbeles tiek izstrādātas kā vienota sistēma, ņemot vērā visas telpas īpatnības un klienta vēlmes.

Mūsu interjera projekti ietver:
• Viesistabas mēbeles
• TV sienas un mediju mēbeles
• Vannas istabas mēbeles
• Biroja mēbeles
• Komerciālo telpu mēbeles
• Viesnīcu un restorānu aprīkojumu`,
      en: `We implement comprehensive interior projects where furniture is developed as a unified system, taking into account all space characteristics and client preferences.

Our interior projects include:
• Living room furniture
• TV walls and media furniture
• Bathroom furniture
• Office furniture
• Commercial space furniture
• Hotel and restaurant equipment`,
      ru: `Мы реализуем комплексные интерьерные проекты, где мебель разрабатывается как единая система с учетом всех особенностей помещения и пожеланий клиента.

Наши интерьерные проекты включают:
• Мебель для гостиной
• ТВ-стены и медиа-мебель
• Мебель для ванной комнаты
• Офисная мебель
• Мебель для коммерческих помещений
• Оборудование для гостиниц и ресторанов`,
    },
    features: [
      {
        lv: 'Kompleksi risinājumi',
        en: 'Comprehensive solutions',
        ru: 'Комплексные решения',
      },
      {
        lv: 'Vienots dizaina koncepts',
        en: 'Unified design concept',
        ru: 'Единая концепция дизайна',
      },
      {
        lv: 'Privātie un komerciālie projekti',
        en: 'Private and commercial projects',
        ru: 'Частные и коммерческие проекты',
      },
      {
        lv: 'Pilns serviss',
        en: 'Full service',
        ru: 'Полный сервис',
      },
    ],
    solutions: [
      {
        lv: 'Dzīvokļu interjeri',
        en: 'Apartment interiors',
        ru: 'Интерьеры квартир',
      },
      {
        lv: 'Privātmāju interjeri',
        en: 'Private house interiors',
        ru: 'Интерьеры частных домов',
      },
      {
        lv: 'Biroju interjeri',
        en: 'Office interiors',
        ru: 'Интерьеры офисов',
      },
      {
        lv: 'Viesnīcas un restorāni',
        en: 'Hotels and restaurants',
        ru: 'Гостиницы и рестораны',
      },
    ],
    heroImage: placeholder('interior-hero'),
    galleryImages: [
      placeholder('interior-1'),
      placeholder('interior-2'),
      placeholder('interior-3'),
      placeholder('interior-4'),
    ],
  },
]

// Helper functions
export function getFurnitureById(id: string): FurnitureType | undefined {
  return furnitureTypes.find(f => f.id === id)
}

export function getFurnitureBySlug(slug: string, locale: 'lv' | 'en' | 'ru'): FurnitureType | undefined {
  return furnitureTypes.find(f => f.slug[locale] === slug)
}

export function getFurnitureSlugs(id: string): FurnitureType['slug'] | undefined {
  const furniture = getFurnitureById(id)
  return furniture?.slug
}

