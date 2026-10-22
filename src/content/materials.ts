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
      lv: 'Cosentino minerālu virsma; sastāvs atšķiras pēc produktu līnijas.',
      en: 'A Cosentino mineral surface; composition varies by product line.',
      ru: 'Минеральная поверхность Cosentino; состав зависит от линейки продукта.',
    },
    longDescription: {
      lv: `Silestone ir Cosentino zīmola minerālu virsmu saime, nevis dabīga akmens plāksne. Sastāvs un ražošanas tehnoloģija atšķiras pēc produktu līnijas, tāpēc pirms izvēles jāpārbauda konkrētās krāsas informācija. Krāsu un rakstu nosaka kolekcijas dizains.

Ražotājs norāda izturību pret ikdienas traipiem un skrāpējumiem konkrētās produktu līnijās, taču īpašības var atšķirties pēc produkta un apdares. Sargājiet virsmu no strauja karstuma trieciena un lietojiet paliktni karstiem traukiem. Precīzai kopšanai sekojiet izvēlētā produkta norādēm.`,
      en: `Silestone is a family of Cosentino-branded mineral surfaces, not a natural stone slab. Composition and manufacturing technology vary by product line, so check the information for the specific colour before choosing. The collection design determines its colour and pattern.

The manufacturer describes resistance to everyday stains and scratches for specific product lines, though properties can vary by product and finish. Protect the surface from thermal shock and use a trivet for hot cookware. Follow the care guide for the selected product.`,
      ru: `Silestone — семейство минеральных поверхностей под брендом Cosentino, а не плита природного камня. Состав и технология производства зависят от линейки, поэтому перед выбором проверьте информацию о конкретном цвете. Рисунок и оттенок определяются дизайном коллекции.

Производитель указывает устойчивость к бытовым пятнам и царапинам для отдельных линеек, однако свойства различаются в зависимости от продукта и отделки. Защищайте поверхность от резкого перепада температуры и используйте подставку для горячей посуды. Следуйте инструкции для выбранного продукта.`,
    },
    features: [
      {
        lv: 'Cosentino zīmola minerālu virsma',
        en: 'Cosentino-branded mineral surface',
        ru: 'Минеральная поверхность бренда Cosentino',
      },
      {
        lv: 'Sastāvs atšķiras pēc produktu līnijas',
        en: 'Composition varies by product line',
        ru: 'Состав зависит от линейки продукта',
      },
      {
        lv: 'Ražotāja norādītās īpašības atšķiras pēc produkta',
        en: 'Manufacturer guidance varies by product',
        ru: 'Характеристики зависят от продукта',
      },
      {
        lv: 'Kopšana atkarīga no izvēlētā produkta',
        en: 'Care depends on the selected product',
        ru: 'Уход зависит от выбранного продукта',
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
      lv: `Dekton ir Cosentino ultra-kompakta minerālu virsma, ko ražo ar augsta spiediena un daļiņu saķepināšanas procesu. Tās dizaini var atgādināt akmeni, betonu vai citus materiālus.

Ražotājs norāda izturību pret traipiem, skrāpējumiem, karstumu un UV starojumu, tāpēc noteiktas kolekcijas var būt piemērotas arī āra lietojumam. Karsti trauki ilgstošai novietošanai jāliek uz paliktņa, jo īpaši uz plānākām plāksnēm; izvairieties no tiešas liesmas un ļoti augstas temperatūras avotiem.`,
      en: `Dekton is a Cosentino ultra-compact mineral surface made using high pressure and a mineral particle sintering process. Its designs can evoke stone, concrete and other materials.

The manufacturer describes resistance to stains, scratches, heat and UV, so selected collections may also suit outdoor applications. Use a trivet for hot cookware left in place for extended periods, especially on thinner slabs; avoid direct flame and very high-temperature sources.`,
      ru: `Dekton — ультракомпактная минеральная поверхность Cosentino, изготовленная под высоким давлением с помощью спекания минеральных частиц. Дизайн может напоминать камень, бетон и другие материалы.

Производитель указывает устойчивость к пятнам, царапинам, жару и УФ-излучению, поэтому некоторые коллекции подходят и для улицы. Для горячей посуды при длительном контакте используйте подставку, особенно на тонких плитах; избегайте открытого огня и прямого воздействия очень высоких температур.`,
    },
    features: [
      {
        lv: 'Ražotājs norāda UV izturību; pārbaudiet kolekcijas piemērotību āra lietojumam',
        en: 'Manufacturer describes UV resistance; check outdoor suitability for the collection',
        ru: 'Производитель указывает устойчивость к УФ; уточните пригодность коллекции для улицы',
      },
      {
        lv: 'Karstiem traukiem ilgstošai novietošanai lietot paliktni',
        en: 'Use a trivet for cookware left hot on the surface for extended periods',
        ru: 'Для горячей посуды при длительном контакте использовать подставку',
      },
      {
        lv: 'Ļoti zema ūdens absorbcija (pēc ražotāja datiem)',
        en: 'Very low water absorption (manufacturer specification)',
        ru: 'Очень низкое водопоглощение (по данным производителя)',
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
      lv: 'Dabīgs granīts ar katrai plāksnei atšķirīgu minerālu rakstu.',
      en: 'Natural granite with mineral patterns that vary from slab to slab.',
      ru: 'Натуральный гранит с неповторимым рисунком каждой плиты.',
    },
    longDescription: {
      lv: `Granīts ir dabīgs magmatisks akmens, un katras plāksnes minerālu graudi un krāsu variācijas ir atšķirīgas. Tādēļ ir vērts apskatīt tieši to plāksni, no kuras plānots izgatavot virsmu.

Dažādu granītu uzsūkšana, cietība un kopšanas vajadzības atšķiras. Dažām plāksnēm var būt vajadzīga impregnēšana; piemērotu kopšanu un hermētiķi nosaka pēc konkrētā akmens.`,
      en: `Granite is a natural igneous stone, and mineral grain and colour vary from slab to slab. It is worth viewing the actual slab intended for your project.

Absorption, hardness and care needs differ among granites. Some slabs may benefit from sealing; choose care and sealer based on the specific stone.`,
      ru: `Гранит — природная магматическая порода; минеральное зерно и цвет отличаются от плиты к плите. Поэтому стоит посмотреть именно ту плиту, которую планируется использовать.

Впитываемость, твёрдость и требования к уходу у разных гранитов различаются. Некоторым плитам может потребоваться пропитка; уход и герметизацию подбирают для конкретного камня.`,
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
        lv: 'Katras plāksnes raksts ir atšķirīgs',
        en: 'Every slab has a distinct pattern',
        ru: 'Рисунок каждой плиты уникален',
      },
      {
        lv: 'Kopšanas vajadzības atšķiras pēc akmens',
        en: 'Care needs vary by stone',
        ru: 'Уход зависит от конкретного камня',
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
      lv: 'Dabīgs marmors ar izteiksmīgām dzīslām un dabiskām variācijām.',
      en: 'Natural marble with distinctive veining and natural variation.',
      ru: 'Натуральный мрамор с выразительными прожилками и природными вариациями.',
    },
    longDescription: {
      lv: `Marmors ir dabīgs metamorfais akmens ar raksturīgām dzīslām un plāksnēm unikālu zīmējumu. Daudzi marmori satur kalcītu, tādēļ skābes, piemēram, citrons vai etiķis, var iegravēt virsmu un padarīt pulējumu matētu.

Tas ir apzināta estētiska izvēle cilvēkiem, kuri novērtē dabiskās variācijas un pieņem saudzīgāku kopšanu un iespējamas lietojuma pēdas. Plāksnes sastāvs un apdare var ietekmēt tās uzvedību, tāpēc pirms izvēles pārrunājiet konkrēto akmeni un kopšanu.`,
      en: `Marble is a natural metamorphic stone with characteristic veining and a pattern unique to each slab. Many marbles contain calcite, so acids such as lemon or vinegar can etch the surface and dull its polish.

It is a considered aesthetic choice for people who value natural variation and accept gentler care and possible signs of use. Composition and finish affect how a slab behaves, so discuss the specific stone and its care before choosing.`,
      ru: `Мрамор — природная метаморфическая порода с характерными прожилками и неповторимым рисунком каждой плиты. Многие виды мрамора содержат кальцит, поэтому кислоты, например лимон или уксус, могут оставить травление и сделать полировку матовой.

Это осознанный эстетический выбор для тех, кто ценит природные вариации и готов к бережному уходу и возможным следам эксплуатации. Состав и отделка влияют на свойства плиты, поэтому перед выбором обсудите конкретный камень и уход за ним.`,
    },
    features: [
      {
        lv: 'Dabīgs metamorfais akmens',
        en: 'Natural metamorphic stone',
        ru: 'Природная метаморфическая порода',
      },
      {
        lv: 'Unikālas dzīslas',
        en: 'Unique veining',
        ru: 'Уникальные прожилки',
      },
      {
        lv: 'Skābes var iegravēt kalcītu saturošu virsmu',
        en: 'Acids can etch calcite-bearing marble',
        ru: 'Кислоты могут оставить след на мраморе с кальцитом',
      },
      {
        lv: 'Kopšana atkarīga no konkrētā akmens un apdares',
        en: 'Care depends on the specific stone and finish',
        ru: 'Уход зависит от конкретного камня и отделки',
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

