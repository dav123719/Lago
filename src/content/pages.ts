// ===================================
// Page Content Data
// ===================================
// Static page content for About, Full Service, Contact, etc.

import { Page } from './types'

export const pages: Page[] = [
  // About Us page
  {
    id: 'about',
    slug: {
      lv: 'par-mums',
      en: 'about-us',
      ru: 'o-nas',
    },
    title: {
      lv: 'Par mums',
      en: 'About Us',
      ru: 'О нас',
    },
    description: {
      lv: 'LAGO – premium akmens virsmu un mēbeļu ražotājs ar vairāk nekā 20 gadu pieredzi.',
      en: 'LAGO – premium stone surface and furniture manufacturer with over 20 years of experience.',
      ru: 'LAGO – премиальный производитель каменных поверхностей и мебели с более чем 20-летним опытом.',
    },
    body: {
      lv: `LAGO ir vadošais akmens virsmu un individuālo mēbeļu ražotājs Latvijā. Kopš 2003. gada mēs esam specializējušies augstas kvalitātes akmens virsmu izgatavošanā un uzstādīšanā.

Mūsu komanda apvieno gadiem uzkrāto pieredzi ar modernākajām tehnoloģijām, lai radītu izstrādājumus, kas kalpos paaudzēm. Mēs lepojamies ar katru projektu, ko īstenojam – no mazām virtuves virsmām līdz lieliem komerciāliem projektiem.

Mūsu vērtības:
• Kvalitāte – tikai labākie materiāli un precīza izpilde
• Uzticamība – mēs turamies pie solījumiem
• Inovācijas – modernākās tehnoloģijas un risinājumi
• Klientu serviss – individuāla pieeja katram projektam`,
      en: `LAGO is the leading stone surface and custom furniture manufacturer in Latvia. Since 2003, we have specialized in the production and installation of high-quality stone surfaces.

Our team combines years of accumulated experience with the latest technologies to create products that will serve for generations. We take pride in every project we complete – from small kitchen countertops to large commercial installations.

Our values:
• Quality – only the best materials and precise execution
• Reliability – we keep our promises
• Innovation – the latest technologies and solutions
• Customer service – individual approach to each project`,
      ru: `LAGO – ведущий производитель каменных поверхностей и индивидуальной мебели в Латвии. С 2003 года мы специализируемся на производстве и установке высококачественных каменных поверхностей.

Наша команда сочетает многолетний накопленный опыт с новейшими технологиями для создания изделий, которые будут служить поколениям. Мы гордимся каждым реализованным проектом – от небольших кухонных столешниц до крупных коммерческих проектов.

Наши ценности:
• Качество – только лучшие материалы и точное исполнение
• Надежность – мы держим свои обещания
• Инновации – новейшие технологии и решения
• Клиентский сервис – индивидуальный подход к каждому проекту`,
    },
    metaTitle: {
      lv: 'Par mums | LAGO',
      en: 'About Us | LAGO',
      ru: 'О нас | LAGO',
    },
    metaDescription: {
      lv: 'Uzziniet vairāk par LAGO – Latvijas vadošo akmens virsmu un mēbeļu ražotāju ar vairāk nekā 20 gadu pieredzi.',
      en: 'Learn more about LAGO – Latvia\'s leading stone surface and furniture manufacturer with over 20 years of experience.',
      ru: 'Узнайте больше о LAGO – ведущем производителе каменных поверхностей и мебели в Латвии с более чем 20-летним опытом.',
    },
  },

  // Full Service page
  {
    id: 'full-service',
    slug: {
      lv: 'pilns-serviss',
      en: 'full-service',
      ru: 'polnyj-servis',
    },
    title: {
      lv: 'Pilns serviss',
      en: 'Full Service',
      ru: 'Полный сервис',
    },
    description: {
      lv: 'No idejas līdz realizācijai – mēs piedāvājam pilnu servisu jūsu projekta īstenošanai.',
      en: 'From idea to realization – we offer full service for your project implementation.',
      ru: 'От идеи до реализации – мы предлагаем полный сервис для воплощения вашего проекта.',
    },
    body: {
      lv: `LAGO piedāvā pilnu servisu no projekta idejas līdz tā realizācijai. Mēs rūpējamies par katru posmu, lai jūs varētu baudīt rezultātu bez rūpēm.

KONSULTĀCIJA UN PROJEKTĒŠANA
Mūsu speciālisti palīdzēs izvēlēties piemērotāko materiālu un dizainu jūsu projektam. Mēs izstrādājam detalizētus rasējumus un 3D vizualizācijas.

UZMĒRĪŠANA
Precīza uzmērīšana ir veiksmīga projekta pamats. Mūsu speciālisti ierodas pie jums, lai veiktu precīzus mērījumus ar modernām lāzera ierīcēm.

RAŽOŠANA
Mūsu ražotnē ar modernākajām CNC iekārtām mēs izgatvojam izstrādājumus ar maksimālu precizitāti. Katra detaļa tiek rūpīgi pārbaudīta.

UZSTĀDĪŠANA
Pieredzējuši montētāji veic uzstādīšanu profesionāli un kārtīgi. Mēs garantējam kvalitatīvu rezultātu un sakopjam darba vietu pēc uzstādīšanas.

GARANTIJA UN APKOPE
Piedāvājam garantiju visiem mūsu izstrādājumiem un konsultējam par pareizu kopšanu, lai jūsu virsmas saglabātu savu skaistumu gadiem ilgi.`,
      en: `LAGO offers full service from project concept to realization. We take care of every stage so you can enjoy the result without worries.

CONSULTATION AND DESIGN
Our specialists will help you choose the most suitable material and design for your project. We develop detailed drawings and 3D visualizations.

MEASUREMENTS
Precise measurement is the foundation of a successful project. Our specialists come to you to take accurate measurements with modern laser devices.

PRODUCTION
In our facility with state-of-the-art CNC equipment, we manufacture products with maximum precision. Every detail is carefully inspected.

INSTALLATION
Experienced installers perform the installation professionally and neatly. We guarantee quality results and clean up the work area after installation.

WARRANTY AND MAINTENANCE
We offer warranty on all our products and provide advice on proper care to keep your surfaces beautiful for years to come.`,
      ru: `LAGO предлагает полный сервис от концепции проекта до его реализации. Мы заботимся о каждом этапе, чтобы вы могли наслаждаться результатом без забот.

КОНСУЛЬТАЦИЯ И ПРОЕКТИРОВАНИЕ
Наши специалисты помогут выбрать наиболее подходящий материал и дизайн для вашего проекта. Мы разрабатываем детальные чертежи и 3D-визуализации.

ЗАМЕРЫ
Точные замеры – основа успешного проекта. Наши специалисты приезжают к вам для проведения точных измерений современными лазерными приборами.

ПРОИЗВОДСТВО
На нашем производстве с современнейшим CNC-оборудованием мы изготавливаем изделия с максимальной точностью. Каждая деталь тщательно проверяется.

УСТАНОВКА
Опытные монтажники выполняют установку профессионально и аккуратно. Мы гарантируем качественный результат и убираем рабочее место после установки.

ГАРАНТИЯ И ОБСЛУЖИВАНИЕ
Мы предоставляем гарантию на все наши изделия и консультируем по правильному уходу, чтобы ваши поверхности сохраняли красоту долгие годы.`,
    },
    metaTitle: {
      lv: 'Pilns serviss | LAGO',
      en: 'Full Service | LAGO',
      ru: 'Полный сервис | LAGO',
    },
    metaDescription: {
      lv: 'LAGO pilns serviss – konsultācija, projektēšana, uzmērīšana, ražošana un uzstādīšana vienuviet.',
      en: 'LAGO full service – consultation, design, measurement, production and installation all in one place.',
      ru: 'Полный сервис LAGO – консультация, проектирование, замеры, производство и установка в одном месте.',
    },
  },

  // Contact page
  {
    id: 'contact',
    slug: {
      lv: 'kontakti',
      en: 'contact',
      ru: 'kontakty',
    },
    title: {
      lv: 'Kontakti',
      en: 'Contact',
      ru: 'Контакты',
    },
    description: {
      lv: 'Sazinieties ar mums – mēs labprāt atbildēsim uz jūsu jautājumiem.',
      en: 'Get in touch with us – we\'ll be happy to answer your questions.',
      ru: 'Свяжитесь с нами – мы с удовольствием ответим на ваши вопросы.',
    },
    body: {
      lv: 'Aizpildiet kontaktformu vai sazinieties ar mums tiešā veidā. Mēs atbildēsim pēc iespējas ātrāk.',
      en: 'Fill out the contact form or get in touch with us directly. We will respond as soon as possible.',
      ru: 'Заполните контактную форму или свяжитесь с нами напрямую. Мы ответим как можно скорее.',
    },
  },

  // Stone Surfaces overview page
  {
    id: 'stone-surfaces',
    slug: {
      lv: 'akmens-virsmas',
      en: 'stone-surfaces',
      ru: 'kamennye-poverhnosti',
    },
    title: {
      lv: 'Akmens virsmas',
      en: 'Stone Surfaces',
      ru: 'Каменные поверхности',
    },
    description: {
      lv: 'Augstas kvalitātes akmens virsmas virtuvēm, vannas istabām un komerciālajiem objektiem.',
      en: 'High-quality stone surfaces for kitchens, bathrooms, and commercial spaces.',
      ru: 'Высококачественные каменные поверхности для кухонь, ванных комнат и коммерческих объектов.',
    },
    body: {
      lv: `Mēs piedāvājam plašu augstas kvalitātes akmens virsmu klāstu no pasaulē atzītiem ražotājiem. Mūsu sortimentā ir gan dabīgie akmeņi, gan inovatīvi kompozītmateriāli.

Katrs materiāls tiek rūpīgi atlasīts, lai nodrošinātu izturību, estētiku un funkcionalitāti. Neatkarīgi no tā, vai vēlaties elegantu marmora virsmu vai praktisku kvarca virsmu – mums ir risinājums jūsu vajadzībām.`,
      en: `We offer a wide range of high-quality stone surfaces from world-renowned manufacturers. Our range includes both natural stones and innovative composite materials.

Each material is carefully selected to ensure durability, aesthetics, and functionality. Whether you want an elegant marble surface or a practical quartz countertop – we have a solution for your needs.`,
      ru: `Мы предлагаем широкий ассортимент высококачественных каменных поверхностей от всемирно известных производителей. В нашем ассортименте как натуральные камни, так и инновационные композитные материалы.

Каждый материал тщательно отобран для обеспечения долговечности, эстетики и функциональности. Будь то элегантная мраморная поверхность или практичная кварцевая столешница – у нас есть решение для ваших потребностей.`,
    },
    metaTitle: {
      lv: 'Akmens virsmas | LAGO',
      en: 'Stone Surfaces | LAGO',
      ru: 'Каменные поверхности | LAGO',
    },
    metaDescription: {
      lv: 'Premium akmens virsmas no Silestone, Dekton, granīta un marmora. Ražošana un uzstādīšana Latvijā.',
      en: 'Premium stone surfaces from Silestone, Dekton, granite and marble. Manufacturing and installation in Latvia.',
      ru: 'Премиальные каменные поверхности из Silestone, Dekton, гранита и мрамора. Производство и установка в Латвии.',
    },
  },

  // Furniture overview page
  {
    id: 'furniture',
    slug: {
      lv: 'mebeles',
      en: 'furniture',
      ru: 'mebel',
    },
    title: {
      lv: 'Mēbeles',
      en: 'Furniture',
      ru: 'Мебель',
    },
    description: {
      lv: 'Individuāli izgatavotās mēbeles jūsu mājām un birojam.',
      en: 'Custom-made furniture for your home and office.',
      ru: 'Мебель индивидуального изготовления для вашего дома и офиса.',
    },
    body: {
      lv: `LAGO piedāvā individuāli projektētas un izgatavotas mēbeles, kas pilnībā atbilst jūsu vajadzībām un telpas īpatnībām. Mūsu speciālisti izstrādā risinājumus, kas apvieno funkcionalitāti ar estētiku.

Mēs izmantojam tikai kvalitatīvus materiālus un modernu ražošanas tehnoloģiju, lai radītu mēbeles, kas kalpos ilgi un iepriecinās ikdienā.`,
      en: `LAGO offers individually designed and manufactured furniture that fully meets your needs and space characteristics. Our specialists develop solutions that combine functionality with aesthetics.

We use only quality materials and modern manufacturing technology to create furniture that will serve long and delight you every day.`,
      ru: `LAGO предлагает индивидуально спроектированную и изготовленную мебель, которая полностью соответствует вашим потребностям и особенностям помещения. Наши специалисты разрабатывают решения, сочетающие функциональность с эстетикой.

Мы используем только качественные материалы и современные производственные технологии для создания мебели, которая будет служить долго и радовать каждый день.`,
    },
    metaTitle: {
      lv: 'Mēbeles | LAGO',
      en: 'Furniture | LAGO',
      ru: 'Мебель | LAGO',
    },
    metaDescription: {
      lv: 'Individuāli izgatavotās virtuves mēbeles, iebūvējamās mēbeles un interjera risinājumi no LAGO.',
      en: 'Custom-made kitchen furniture, built-in furniture and interior solutions from LAGO.',
      ru: 'Кухонная мебель, встроенная мебель и интерьерные решения индивидуального изготовления от LAGO.',
    },
  },

  // Projects overview page
  {
    id: 'projects',
    slug: {
      lv: 'projekti',
      en: 'projects',
      ru: 'proekty',
    },
    title: {
      lv: 'Projekti',
      en: 'Projects',
      ru: 'Проекты',
    },
    description: {
      lv: 'Iepazīstieties ar mūsu realizētajiem projektiem.',
      en: 'Explore our completed projects.',
      ru: 'Познакомьтесь с нашими реализованными проектами.',
    },
    body: {
      lv: 'Šeit jūs varat apskatīt mūsu realizētos projektus. Katrs projekts ir unikāls un atspoguļo mūsu komandas profesionalitāti un uzmanību detaļām.',
      en: 'Here you can view our completed projects. Each project is unique and reflects our team\'s professionalism and attention to detail.',
      ru: 'Здесь вы можете просмотреть наши реализованные проекты. Каждый проект уникален и отражает профессионализм нашей команды и внимание к деталям.',
    },
    metaTitle: {
      lv: 'Projekti | LAGO',
      en: 'Projects | LAGO',
      ru: 'Проекты | LAGO',
    },
    metaDescription: {
      lv: 'LAGO realizētie projekti – akmens virsmas un mēbeles privātmājām un komerciālajiem objektiem.',
      en: 'LAGO completed projects – stone surfaces and furniture for private homes and commercial spaces.',
      ru: 'Реализованные проекты LAGO – каменные поверхности и мебель для частных домов и коммерческих объектов.',
    },
  },
]

// Helper function to get a page by its ID
export function getPageById(id: string): Page | undefined {
  return pages.find(page => page.id === id)
}

// Helper function to get a page by slug and locale
export function getPageBySlug(slug: string, locale: 'lv' | 'en' | 'ru'): Page | undefined {
  return pages.find(page => page.slug[locale] === slug)
}

// Helper function to get all slugs for a page (for language switching)
export function getPageSlugs(id: string): Page['slug'] | undefined {
  const page = getPageById(id)
  return page?.slug
}

