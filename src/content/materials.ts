// ===================================
// Materials Content Data
// ===================================
// Stone materials data with localized content

import { Material, MaterialColor } from './types'

// Local images from original lago.lv website
const materialImages = {
  silestone: {
    hero: '/images/materials/silestone/silestone-seaport.jpg',
    seaport: '/images/materials/silestone/silestone-seaport.jpg',
    silkenPearl: '/images/materials/silestone/silestone-silken-pearl.jpg',
    calaBlue: '/images/materials/silestone/silestone-cala-blue.jpg',
    arcillaRed: '/images/materials/silestone/silestone-arcilla-red.jpg',
    posidoniaGreen: '/images/materials/silestone/silestone-posidonia-green.jpg',
  },
  dekton: {
    hero: '/images/materials/dekton/dekton-nolita.jpg',
    nolita: '/images/materials/dekton/dekton-nolita.jpg',
    corktown: '/images/materials/dekton/dekton-corktown.jpg',
    galema: '/images/materials/dekton/dekton-galema.jpg',
    ventus: '/images/materials/dekton/dekton-ventus.jpg',
  },
  granite: {
    hero: '/images/materials/granite/granite-charcoal.jpg',
    charcoal: '/images/materials/granite/granite-charcoal.jpg',
  },
  marble: {
    hero: '/images/materials/marble/marble-emperador.jpg',
    emperador: '/images/materials/marble/marble-emperador.jpg',
    biancoCalcatta: '/images/materials/marble/marble-bianco-calcatta.jpg',
    classicCalcatta: '/images/materials/marble/marble-classic-calcatta.jpg',
  },
}

// Helper to create placeholder image paths
const placeholder = (name: string) => `/images/materials/${name}.jpg`

// Silestone colors
const silestoneColors: MaterialColor[] = [
  {
    id: 'eternal-calacatta-gold',
    name: {
      lv: 'Eternal Calacatta Gold',
      en: 'Eternal Calacatta Gold',
      ru: 'Eternal Calacatta Gold',
    },
    description: {
      lv: 'Elegants balts tonis ar zelta dzīslām, iedvesmots no itāļu marmora.',
      en: 'Elegant white tone with golden veins, inspired by Italian marble.',
      ru: 'Элегантный белый тон с золотыми прожилками, вдохновленный итальянским мрамором.',
    },
    image: placeholder('silestone-calacatta-gold'),
    category: 'light',
  },
  {
    id: 'charcoal-soapstone',
    name: {
      lv: 'Charcoal Soapstone',
      en: 'Charcoal Soapstone',
      ru: 'Charcoal Soapstone',
    },
    description: {
      lv: 'Tumši pelēks tonis ar maigu tekstūru.',
      en: 'Dark grey tone with soft texture.',
      ru: 'Темно-серый тон с мягкой текстурой.',
    },
    image: placeholder('silestone-charcoal'),
    category: 'dark',
  },
  {
    id: 'white-storm',
    name: {
      lv: 'White Storm',
      en: 'White Storm',
      ru: 'White Storm',
    },
    description: {
      lv: 'Tīri balts ar smalkām pelēkām dzīslām.',
      en: 'Pure white with fine grey veining.',
      ru: 'Чисто белый с тонкими серыми прожилками.',
    },
    image: placeholder('silestone-white-storm'),
    category: 'light',
  },
  {
    id: 'negro-stellar',
    name: {
      lv: 'Negro Stellar',
      en: 'Negro Stellar',
      ru: 'Negro Stellar',
    },
    description: {
      lv: 'Dziļi melns ar mirdzošām daļiņām.',
      en: 'Deep black with sparkling particles.',
      ru: 'Глубокий черный с блестящими частицами.',
    },
    image: placeholder('silestone-negro-stellar'),
    category: 'dark',
  },
]

// Dekton colors
const dektonColors: MaterialColor[] = [
  {
    id: 'dekton-bergen',
    name: {
      lv: 'Bergen',
      en: 'Bergen',
      ru: 'Bergen',
    },
    description: {
      lv: 'Gaiši pelēks ar maigu betona tekstūru.',
      en: 'Light grey with soft concrete texture.',
      ru: 'Светло-серый с мягкой текстурой бетона.',
    },
    image: placeholder('dekton-bergen'),
    category: 'light',
  },
  {
    id: 'dekton-kelya',
    name: {
      lv: 'Kelya',
      en: 'Kelya',
      ru: 'Kelya',
    },
    description: {
      lv: 'Tumšs tonis ar izteiktu tekstūru.',
      en: 'Dark tone with pronounced texture.',
      ru: 'Темный тон с выраженной текстурой.',
    },
    image: placeholder('dekton-kelya'),
    category: 'dark',
  },
  {
    id: 'dekton-entzo',
    name: {
      lv: 'Entzo',
      en: 'Entzo',
      ru: 'Entzo',
    },
    description: {
      lv: 'Marmora iedvesmots dizains ar dramatiskām dzīslām.',
      en: 'Marble-inspired design with dramatic veining.',
      ru: 'Дизайн, вдохновленный мрамором, с драматичными прожилками.',
    },
    image: placeholder('dekton-entzo'),
    category: 'veined',
  },
]

// Granite colors
const graniteColors: MaterialColor[] = [
  {
    id: 'absolute-black',
    name: {
      lv: 'Absolute Black',
      en: 'Absolute Black',
      ru: 'Absolute Black',
    },
    description: {
      lv: 'Klasiskais melnais granīts ar vienmērīgu toni.',
      en: 'Classic black granite with uniform tone.',
      ru: 'Классический черный гранит с равномерным тоном.',
    },
    image: placeholder('granite-absolute-black'),
    category: 'dark',
  },
  {
    id: 'baltic-brown',
    name: {
      lv: 'Baltic Brown',
      en: 'Baltic Brown',
      ru: 'Baltic Brown',
    },
    description: {
      lv: 'Silts brūns tonis ar raksturīgu rakstu.',
      en: 'Warm brown tone with characteristic pattern.',
      ru: 'Теплый коричневый тон с характерным рисунком.',
    },
    image: placeholder('granite-baltic-brown'),
    category: 'dark',
  },
  {
    id: 'bianco-sardo',
    name: {
      lv: 'Bianco Sardo',
      en: 'Bianco Sardo',
      ru: 'Bianco Sardo',
    },
    description: {
      lv: 'Gaišs granīts ar pelēkiem un rozā toņiem.',
      en: 'Light granite with grey and pink tones.',
      ru: 'Светлый гранит с серыми и розовыми тонами.',
    },
    image: placeholder('granite-bianco-sardo'),
    category: 'light',
  },
]

// Marble colors
const marbleColors: MaterialColor[] = [
  {
    id: 'carrara-white',
    name: {
      lv: 'Carrara White',
      en: 'Carrara White',
      ru: 'Carrara White',
    },
    description: {
      lv: 'Ikoniskais itāļu marmors ar smalkām pelēkām dzīslām.',
      en: 'Iconic Italian marble with fine grey veining.',
      ru: 'Культовый итальянский мрамор с тонкими серыми прожилками.',
    },
    image: placeholder('marble-carrara'),
    category: 'light',
  },
  {
    id: 'calacatta-oro',
    name: {
      lv: 'Calacatta Oro',
      en: 'Calacatta Oro',
      ru: 'Calacatta Oro',
    },
    description: {
      lv: 'Luksusa marmors ar zeltainām dzīslām.',
      en: 'Luxury marble with golden veining.',
      ru: 'Роскошный мрамор с золотистыми прожилками.',
    },
    image: placeholder('marble-calacatta'),
    category: 'veined',
  },
  {
    id: 'nero-marquina',
    name: {
      lv: 'Nero Marquina',
      en: 'Nero Marquina',
      ru: 'Nero Marquina',
    },
    description: {
      lv: 'Spāņu melnais marmors ar baltām dzīslām.',
      en: 'Spanish black marble with white veining.',
      ru: 'Испанский черный мрамор с белыми прожилками.',
    },
    image: placeholder('marble-nero-marquina'),
    category: 'dark',
  },
]

export const materials: Material[] = [
  // Silestone
  {
    id: 'silestone',
    slug: {
      lv: 'silestone',
      en: 'silestone',
      ru: 'silestone',
    },
    name: {
      lv: 'Silestone',
      en: 'Silestone',
      ru: 'Silestone',
    },
    type: 'silestone',
    description: {
      lv: 'Premium kvarca virsmas ar HybriQ+ tehnoloģiju.',
      en: 'Premium quartz surfaces with HybriQ+ technology.',
      ru: 'Премиальные кварцевые поверхности с технологией HybriQ+.',
    },
    longDescription: {
      lv: `Silestone ir pasaulē vadošais kvarca virsmu zīmols, ko ražo Cosentino grupa. Pateicoties inovatīvajai HybriQ+ tehnoloģijai, Silestone virsmas apvieno dabīgā kvarca izturību ar vieglu kopšanu.

Silestone virsmas ir ideāli piemērotas virtuvēm un vannas istabām, jo tās ir izturīgas pret skrāpējumiem, triecieniem un karstumu. Plašais krāsu un tekstūru klāsts ļauj atrast ideālo risinājumu jebkuram interjerim.`,
      en: `Silestone is the world's leading quartz surface brand, manufactured by the Cosentino group. Thanks to the innovative HybriQ+ technology, Silestone surfaces combine the durability of natural quartz with easy maintenance.

Silestone surfaces are ideally suited for kitchens and bathrooms as they are resistant to scratches, impacts, and heat. The wide range of colors and textures allows you to find the perfect solution for any interior.`,
      ru: `Silestone — ведущий мировой бренд кварцевых поверхностей, производимый группой Cosentino. Благодаря инновационной технологии HybriQ+ поверхности Silestone сочетают прочность натурального кварца с легкостью ухода.

Поверхности Silestone идеально подходят для кухонь и ванных комнат, так как устойчивы к царапинам, ударам и высоким температурам. Широкий выбор цветов и текстур позволяет найти идеальное решение для любого интерьера.`,
    },
    features: [
      {
        lv: 'Izturīgs pret skrāpējumiem',
        en: 'Scratch resistant',
        ru: 'Устойчив к царапинам',
      },
      {
        lv: 'Higiēnisks – N-Boost tehnoloģija',
        en: 'Hygienic – N-Boost technology',
        ru: 'Гигиеничный – технология N-Boost',
      },
      {
        lv: 'Viegla kopšana',
        en: 'Easy to maintain',
        ru: 'Легкий уход',
      },
      {
        lv: '25 gadu garantija',
        en: '25-year warranty',
        ru: 'Гарантия 25 лет',
      },
    ],
    colors: silestoneColors,
    heroImage: materialImages.silestone.hero,
  },

  // Dekton
  {
    id: 'dekton',
    slug: {
      lv: 'dekton',
      en: 'dekton',
      ru: 'dekton',
    },
    name: {
      lv: 'Dekton',
      en: 'Dekton',
      ru: 'Dekton',
    },
    type: 'dekton',
    description: {
      lv: 'Ultra-kompaktas virsmas āra un iekštelpu lietojumam.',
      en: 'Ultra-compact surfaces for indoor and outdoor use.',
      ru: 'Ультракомпактные поверхности для внутреннего и наружного использования.',
    },
    longDescription: {
      lv: `Dekton ir revolucionārs ultra-kompakts materiāls, kas apvieno stikla, porcelāna un kvarca labākās īpašības. Tas ir ideāls gan iekštelpu, gan āra lietojumam.

Dekton ir ārkārtīgi izturīgs – tas iztur UV starojumu, karstumu, aukstumu un ķīmiskās vielas. Tas ir ideāli piemērots virtuves virsmām, fasādēm, grīdām un pat kamīnu apdarei.`,
      en: `Dekton is a revolutionary ultra-compact material that combines the best properties of glass, porcelain, and quartz. It is ideal for both indoor and outdoor use.

Dekton is extremely durable – it withstands UV radiation, heat, cold, and chemicals. It is perfectly suited for kitchen countertops, facades, floors, and even fireplace surrounds.`,
      ru: `Dekton — революционный ультракомпактный материал, сочетающий лучшие свойства стекла, фарфора и кварца. Он идеален как для внутреннего, так и для наружного использования.

Dekton чрезвычайно прочен — он выдерживает УФ-излучение, жару, холод и химические вещества. Он идеально подходит для кухонных столешниц, фасадов, полов и даже облицовки каминов.`,
    },
    features: [
      {
        lv: 'UV izturīgs – ideāls āra lietojumam',
        en: 'UV resistant – ideal for outdoor use',
        ru: 'Устойчив к УФ – идеален для наружного использования',
      },
      {
        lv: 'Izturīgs pret karstumu',
        en: 'Heat resistant',
        ru: 'Устойчив к высоким температурам',
      },
      {
        lv: 'Nulles porainība',
        en: 'Zero porosity',
        ru: 'Нулевая пористость',
      },
      {
        lv: 'Liela formāta plāksnes',
        en: 'Large format slabs',
        ru: 'Крупноформатные плиты',
      },
    ],
    colors: dektonColors,
    heroImage: materialImages.dekton.hero,
  },

  // Granite
  {
    id: 'granite',
    slug: {
      lv: 'granits',
      en: 'granite',
      ru: 'granit',
    },
    name: {
      lv: 'Granīts',
      en: 'Granite',
      ru: 'Гранит',
    },
    type: 'granite',
    description: {
      lv: 'Dabīgais granīts – mūžīga klasika un izturība.',
      en: 'Natural granite – timeless classic and durability.',
      ru: 'Натуральный гранит – вечная классика и прочность.',
    },
    longDescription: {
      lv: `Granīts ir viens no izturīgākajiem dabīgajiem akmeņiem, kas pieejams plašā krāsu un rakstu gamā. Katrs granīta gabals ir unikāls, jo dabas radīts.

Granīta virsmas ir ārkārtīgi izturīgas un piemērotas intensīvai ikdienas lietošanai. Ar pareizu kopšanu granīta virsmas kalpos paaudzēm, nezaudējot savu skaistumu.`,
      en: `Granite is one of the most durable natural stones available in a wide range of colors and patterns. Each piece of granite is unique as it is created by nature.

Granite surfaces are extremely durable and suitable for intensive daily use. With proper care, granite surfaces will serve for generations without losing their beauty.`,
      ru: `Гранит — один из самых прочных натуральных камней, доступный в широкой гамме цветов и рисунков. Каждый кусок гранита уникален, так как создан природой.

Гранитные поверхности чрезвычайно прочны и подходят для интенсивного ежедневного использования. При правильном уходе гранитные поверхности прослужат поколениям, не теряя своей красоты.`,
    },
    features: [
      {
        lv: '100% dabīgs materiāls',
        en: '100% natural material',
        ru: '100% натуральный материал',
      },
      {
        lv: 'Unikāls raksts',
        en: 'Unique pattern',
        ru: 'Уникальный рисунок',
      },
      {
        lv: 'Ārkārtīgi izturīgs',
        en: 'Extremely durable',
        ru: 'Чрезвычайно прочный',
      },
      {
        lv: 'Izturīgs pret karstumu',
        en: 'Heat resistant',
        ru: 'Устойчив к высоким температурам',
      },
    ],
    colors: graniteColors,
    heroImage: materialImages.granite.hero,
  },

  // Marble
  {
    id: 'marble',
    slug: {
      lv: 'marmors',
      en: 'marble',
      ru: 'mramor',
    },
    name: {
      lv: 'Marmors',
      en: 'Marble',
      ru: 'Мрамор',
    },
    type: 'marble',
    description: {
      lv: 'Elegants dabīgais marmors ekskluzīvam interjeram.',
      en: 'Elegant natural marble for exclusive interiors.',
      ru: 'Элегантный натуральный мрамор для эксклюзивных интерьеров.',
    },
    longDescription: {
      lv: `Marmors ir gadsimtiem iemīļots materiāls, kas asociējas ar eleganci un greznību. Tā unikālās dzīslas un maigie toņi rada neatkārtojamu atmosfēru jebkurā telpā.

Lai gan marmors prasa rūpīgāku kopšanu nekā citi materiāli, tā skaistums un prestižs ir neaizstājams. Mēs piedāvājam plašu marmora izvēli no labākajām pasaules atradnēm.`,
      en: `Marble has been a beloved material for centuries, associated with elegance and luxury. Its unique veining and soft tones create an incomparable atmosphere in any space.

While marble requires more careful maintenance than other materials, its beauty and prestige are irreplaceable. We offer a wide selection of marble from the world's best quarries.`,
      ru: `Мрамор — веками любимый материал, ассоциирующийся с элегантностью и роскошью. Его уникальные прожилки и мягкие тона создают неповторимую атмосферу в любом пространстве.

Хотя мрамор требует более тщательного ухода, чем другие материалы, его красота и престиж незаменимы. Мы предлагаем широкий выбор мрамора из лучших карьеров мира.`,
    },
    features: [
      {
        lv: 'Mūžīga elegance',
        en: 'Timeless elegance',
        ru: 'Вечная элегантность',
      },
      {
        lv: 'Unikālas dzīslas',
        en: 'Unique veining',
        ru: 'Уникальные прожилки',
      },
      {
        lv: 'Dabīgais vēsums',
        en: 'Natural coolness',
        ru: 'Естественная прохлада',
      },
      {
        lv: 'Prestiža materiāls',
        en: 'Prestigious material',
        ru: 'Престижный материал',
      },
    ],
    colors: marbleColors,
    heroImage: materialImages.marble.hero,
  },
]

// Helper functions
export function getMaterialById(id: string): Material | undefined {
  return materials.find(m => m.id === id)
}

export function getMaterialBySlug(slug: string, locale: 'lv' | 'en' | 'ru'): Material | undefined {
  return materials.find(m => m.slug[locale] === slug)
}

export function getMaterialsByType(type: Material['type']): Material[] {
  return materials.filter(m => m.type === type)
}

export function getMaterialSlugs(id: string): Material['slug'] | undefined {
  const material = getMaterialById(id)
  return material?.slug
}

