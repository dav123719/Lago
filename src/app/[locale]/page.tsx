import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { HeroImageCarousel } from '@/components/ui/HeroImageCarousel'
import { NeonButton } from '@/components/ui/NeonButton'
import { companyInfo } from '@/content/company'
import { projects } from '@/content/projects'
import { Locale, locales } from '@/lib/i18n/config'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

const copy = {
  lv: {
    title: 'Akmens virsmas un mēbeles pēc pasūtījuma',
    description: 'LAGO projektē, izgatavo un uzstāda akmens virsmas un individuālas mēbeles virtuvēm un interjeriem. Latvijā kopš 2003. gada.',
    heroEyebrow: 'Akmens virsmas · Individuālas mēbeles',
    heroTitle: 'Akmens virsmas un mēbeles pēc pasūtījuma',
    heroBody: 'Akmens virsmas un mēbeles, kas radītas jūsu virtuvei un interjeram — no materiāla izvēles līdz izgatavošanai un uzstādīšanai.',
    heroMaterials: 'Apskatīt materiālus', heroProjects: 'Apskatīt darbus',
    offeringsEyebrow: 'Ko mēs darām', offeringsTitle: 'Risinājumi, kas sākas ar jūsu telpu',
    stone: 'Akmens virsmas', stoneBody: 'Virtuves un vannas istabas virsmas, sienu paneļi, izlietnes un citi akmens elementi dzīvojamām un komerciālām telpām.',
    furniture: 'Individuālas mēbeles', furnitureBody: 'Pēc pasūtījuma veidotas virtuves un iebūvējamās mēbeles, saskaņotas ar telpu un izvēlētajām virsmām.',
    explore: 'Uzzināt vairāk', workEyebrow: 'LAGO darbi', workTitle: 'Īstenoti projekti', workBody: 'Akmens un mēbeles dažādām telpām — apskatiet, kā materiāli strādā reālos projektos.', allProjects: 'Visi projekti',
    processEyebrow: 'No ieceres līdz uzstādīšanai', processTitle: 'Skaidrs ceļš līdz gatavam risinājumam',
    step1: 'Pārrunājam ieceri', step1Body: 'Noskaidrojam telpas vajadzības un projekta ieceri.',
    step2: 'Izvēlamies materiālu', step2Body: 'Apskatām materiālus un izvēlamies piemērotu risinājumu.',
    step3: 'Izgatavojam un uzstādām', step3Body: 'Sagatavojam virsmas vai mēbeles un uzstādām tās telpā.',
    since: 'Latvijā kopš 2003. gada', contactEyebrow: 'Sāksim sarunu', contactTitle: 'Pastāstiet par savu projektu', contactBody: 'Sazinieties ar LAGO par akmens virsmām vai individuālām mēbelēm. Vienosimies par nākamo soli.', contactCta: 'Pieteikt projektu', address: 'Rīga, Latvija', hours: 'P–Pk 9.00–18.00 · S pēc vienošanās',
  },
  en: {
    title: 'Custom stone surfaces and furniture',
    description: 'LAGO designs, makes and installs stone surfaces and made-to-measure furniture for kitchens and interiors. In Latvia since 2003.',
    heroEyebrow: 'Stone surfaces · Custom furniture',
    heroTitle: 'Stone surfaces and made-to-measure furniture',
    heroBody: 'Stone surfaces and furniture made for your kitchen and interior — from material selection through fabrication and installation.',
    heroMaterials: 'Explore materials', heroProjects: 'View our work',
    offeringsEyebrow: 'What we make', offeringsTitle: 'Solutions shaped around your space',
    stone: 'Stone surfaces', stoneBody: 'Kitchen and bathroom countertops, wall panels, sinks and other stone elements for residential and commercial spaces.',
    furniture: 'Custom furniture', furnitureBody: 'Made-to-measure kitchens and built-in furniture, planned for the room and coordinated with your chosen surfaces.',
    explore: 'Explore the service', workEyebrow: 'LAGO projects', workTitle: 'Made for real spaces', workBody: 'Stone and furniture for a range of interiors. See how the materials come together in completed projects.', allProjects: 'View all projects',
    processEyebrow: 'From idea to installation', processTitle: 'A clear path to a finished solution',
    step1: 'Discuss the idea', step1Body: 'We learn what the space needs and what you have in mind.',
    step2: 'Choose the material', step2Body: 'We look at the materials and select a suitable direction.',
    step3: 'Make and install', step3Body: 'We fabricate the surfaces or furniture and install them in the space.',
    since: 'In Latvia since 2003', contactEyebrow: 'Start a conversation', contactTitle: 'Tell us about your project', contactBody: 'Talk to LAGO about stone surfaces or custom furniture and agree on the next step.', contactCta: 'Enquire about a project', address: 'Riga, Latvia', hours: 'Mon–Fri 9:00–18:00 · Sat by appointment',
  },
  ru: {
    title: 'Каменные поверхности и мебель на заказ',
    description: 'LAGO проектирует, изготавливает и устанавливает каменные поверхности и мебель на заказ для кухонь и интерьеров. Работаем в Латвии с 2003 года.',
    heroEyebrow: 'Каменные поверхности · Мебель на заказ',
    heroTitle: 'Каменные поверхности и мебель на заказ',
    heroBody: 'Каменные поверхности и мебель для вашей кухни и интерьера — от выбора материала до изготовления и установки.',
    heroMaterials: 'Материалы', heroProjects: 'Наши работы',
    offeringsEyebrow: 'Что мы создаём', offeringsTitle: 'Решения для вашего пространства',
    stone: 'Каменные поверхности', stoneBody: 'Столешницы для кухни и ванной, стеновые панели, мойки и другие каменные элементы для жилых и коммерческих помещений.',
    furniture: 'Мебель на заказ', furnitureBody: 'Кухни и встроенная мебель по индивидуальным размерам, согласованные с помещением и выбранными поверхностями.',
    explore: 'Подробнее', workEyebrow: 'Проекты LAGO', workTitle: 'Решения для реальных пространств', workBody: 'Камень и мебель для разных интерьеров. Посмотрите, как материалы сочетаются в готовых проектах.', allProjects: 'Все проекты',
    processEyebrow: 'От идеи до установки', processTitle: 'Понятный путь к готовому решению',
    step1: 'Обсуждаем идею', step1Body: 'Уточняем потребности помещения и ваши пожелания.',
    step2: 'Выбираем материал', step2Body: 'Знакомимся с материалами и выбираем подходящий вариант.',
    step3: 'Изготавливаем и устанавливаем', step3Body: 'Изготавливаем поверхности или мебель и устанавливаем их в помещении.',
    since: 'В Латвии с 2003 года', contactEyebrow: 'Начнём разговор', contactTitle: 'Расскажите о своём проекте', contactBody: 'Свяжитесь с LAGO по поводу каменных поверхностей или мебели на заказ, чтобы обсудить следующий шаг.', contactCta: 'Обсудить проект', address: 'Рига, Латвия', hours: 'Пн–Пт 9:00–18:00 · Сб по договорённости',
  },
} satisfies Record<Locale, Record<string, string>>

const materialRoutes: Record<string, Record<Locale, string>> = {
  silestone: { lv: 'silestone', en: 'silestone', ru: 'silestone' },
  dekton: { lv: 'dekton', en: 'dekton', ru: 'dekton' },
  granite: { lv: 'granits', en: 'granite', ru: 'granit' },
  marble: { lv: 'marmors', en: 'marble', ru: 'mramor' },
}

const materialGuide = {
  lv: {
    eyebrow: 'Sāciet ar to, kas svarīgs jums',
    title: 'Četri materiāli, atšķirīga ikdienas pieredze',
    intro: 'Svarīgākais nav atrast vienu “labāko” virsmu, bet saprast, kā izskats un kopšana iederēsies jūsu mājās.',
    type: 'Kas tas ir', look: 'Izskats', consider: 'Ikdienā ņemiet vērā', link: 'Apskatīt materiālu',
    note: 'Materiāla īpašības atšķiras pēc konkrētās kolekcijas, krāsas, apdares un biezuma. Pirms izvēles pārbaudīsim izvēlētās plāksnes ražotāja kopšanas un lietošanas norādes. Cena ir atkarīga no materiāla un projekta apjoma; to precizēsim individuāli.',
    sources: 'Informācijas avoti:', sourceCosentino: 'Cosentino par Silestone', sourceDekton: 'Dekton kopšana un lietošana', sourceStone: 'Natural Stone Institute par akmens kopšanu',
    priorityTitle: 'Kurš raksturs atbilst jūsu iecerei?',
    priorities: [
      { label: 'Katrs raksts ir dabas veidots', materials: [{ id: 'granite', label: 'Granīts' }, { id: 'marble', label: 'Marmors' }] },
      { label: 'Vēlos izvēlēties noteiktu krāsu un rakstu', materials: [{ id: 'silestone', label: 'Silestone' }, { id: 'dekton', label: 'Dekton' }] },
      { label: 'Virsma būs arī ārā, saulē', materials: [{ id: 'dekton', label: 'Dekton' }] },
      { label: 'Dzīslas ir galvenais akcents', materials: [{ id: 'marble', label: 'Marmors' }, { id: 'silestone', label: 'Silestone' }] },
    ],
    items: [
      { id: 'silestone', name: 'Silestone', image: '/images/materials/silestone/silestone-seaport.jpg', type: 'Cosentino minerālu virsma ar HybriQ+® tehnoloģiju; sastāvā ir minerāli un pārstrādāti materiāli.', look: 'Plaša dizainu izvēle — no mierīgiem, vienmērīgākiem toņiem līdz izteiksmīgām dzīslām.', consider: 'Ražotājs norāda izturību pret ikdienas traipiem, skrāpējumiem un triecieniem, taču specifika mainās pēc produkta. Sargājiet no strauja karstuma trieciena un ievērojiet konkrētā produkta kopšanas norādes.' },
      { id: 'dekton', name: 'Dekton', image: '/images/materials/dekton/dekton-nolita.jpg', type: 'Cosentino ultra-kompakta minerālu virsma, ko veido daļiņu saķepināšanas process.', look: 'Dažādi akmens, betona un citi dizaini lielām, vizuāli vienotām virsmām.', consider: 'Ražotājs norāda izturību pret traipiem, skrāpējumiem, karstumu un UV starojumu. Ilgstošai karstu trauku novietošanai ražotājs iesaka paliktni, jo īpaši plānākiem biezumiem.' },
      { id: 'granite', name: 'Granīts', image: '/images/materials/granite/granite-charcoal.jpg', type: 'Dabīgs magmatisks akmens; katrai plāksnei ir savs minerālu raksts.', look: 'Dabiskas krāsu un graudu variācijas; plāksnes jāizvēlas dzīvē, jo raksts neatkārtojas.', consider: 'Uzsūkšana un vajadzība pēc impregnēšanas atšķiras atkarībā no konkrētā akmens. Kopšanas līdzekļus un blīvēšanu nosaka pēc plāksnes īpašībām.' },
      { id: 'marble', name: 'Marmors', image: '/images/materials/marble/marble-emperador.jpg', type: 'Dabīgs, parasti kalcītu saturošs metamorfais akmens.', look: 'Izteiksmīgas, dabiskas dzīslas un toņu pārejas; katra plāksne ir atšķirīga.', consider: 'Skābi produkti, piemēram, citrons vai etiķis, var iegravēt (matēt) kalcītu saturošu marmoru. Tas ir piemērots, ja pieņemat saudzīgāku kopšanu un iespējamās lietojuma pēdas.' },
    ],
  },
  en: {
    eyebrow: 'Start with what matters to you',
    title: 'Four materials, different everyday trade-offs',
    intro: 'There is no single “best” surface. The right choice depends on how you want it to look and how it will fit your daily routine.',
    type: 'What it is', look: 'Appearance', consider: 'In everyday use', link: 'Explore material',
    note: 'Properties vary by collection, colour, finish and thickness. Before you choose, we can confirm the selected slab’s manufacturer care and use guidance. Price depends on the material and project scope, so we quote it individually.',
    sources: 'Sources:', sourceCosentino: 'Cosentino on Silestone', sourceDekton: 'Dekton care and use', sourceStone: 'Natural Stone Institute stone care',
    priorityTitle: 'Which character fits your idea?',
    priorities: [
      { label: 'I want nature-made variation', materials: [{ id: 'granite', label: 'Granite' }, { id: 'marble', label: 'Marble' }] },
      { label: 'I want to select a defined colour and pattern', materials: [{ id: 'silestone', label: 'Silestone' }, { id: 'dekton', label: 'Dekton' }] },
      { label: 'The surface will be outdoors in sunlight', materials: [{ id: 'dekton', label: 'Dekton' }] },
      { label: 'Veining should be the main feature', materials: [{ id: 'marble', label: 'Marble' }, { id: 'silestone', label: 'Silestone' }] },
    ],
    items: [
      { id: 'silestone', name: 'Silestone', image: '/images/materials/silestone/silestone-seaport.jpg', type: 'Cosentino mineral surface made with HybriQ+® technology, using minerals and recycled materials.', look: 'A broad design range, from quieter, more consistent tones to expressive veining.', consider: 'The manufacturer describes resistance to everyday stains, scratches and impacts, but details vary by product. Protect it from sudden thermal shock and follow the care guide for the chosen product.' },
      { id: 'dekton', name: 'Dekton', image: '/images/materials/dekton/dekton-nolita.jpg', type: 'Cosentino ultra-compact mineral surface formed through a mineral particle sintering process.', look: 'A range of stone, concrete and other designs for visually continuous large surfaces.', consider: 'The manufacturer describes resistance to stains, scratches, heat and UV. For hot cookware left for extended periods, it recommends a trivet, especially with thinner slabs.' },
      { id: 'granite', name: 'Granite', image: '/images/materials/granite/granite-charcoal.jpg', type: 'Natural igneous stone; each slab has its own mineral pattern.', look: 'Natural colour and grain variation. View the actual slab because patterns do not repeat.', consider: 'Absorption and whether sealing is needed depend on the specific stone. Care products and sealing should be chosen for the slab’s properties.' },
      { id: 'marble', name: 'Marble', image: '/images/materials/marble/marble-emperador.jpg', type: 'Natural metamorphic stone, typically containing calcite.', look: 'Distinctive natural veining and shifts in tone; each slab is different.', consider: 'Acids such as lemon or vinegar can etch (dull) calcite-bearing marble. It suits people comfortable with gentler care and the possibility of signs of use.' },
    ],
  },
  ru: {
    eyebrow: 'Начните с того, что важно именно вам',
    title: 'Четыре материала — разные особенности в быту',
    intro: 'Не существует одной «лучшей» поверхности. Выбор зависит от желаемого вида и того, как материал впишется в повседневную жизнь.',
    type: 'Что это', look: 'Внешний вид', consider: 'В повседневном использовании', link: 'Подробнее о материале',
    note: 'Свойства зависят от коллекции, цвета, отделки и толщины. Перед выбором мы уточним рекомендации производителя по уходу и использованию конкретной плиты. Стоимость зависит от материала и объёма проекта и рассчитывается индивидуально.',
    sources: 'Источники:', sourceCosentino: 'Silestone на сайте Cosentino', sourceDekton: 'Уход и использование Dekton', sourceStone: 'Уход за камнем — Natural Stone Institute',
    priorityTitle: 'Какой характер ближе вашей идее?',
    priorities: [
      { label: 'Хочу природный неповторимый рисунок', materials: [{ id: 'granite', label: 'Гранит' }, { id: 'marble', label: 'Мрамор' }] },
      { label: 'Хочу выбрать определённый цвет и рисунок', materials: [{ id: 'silestone', label: 'Silestone' }, { id: 'dekton', label: 'Dekton' }] },
      { label: 'Поверхность будет снаружи, на солнце', materials: [{ id: 'dekton', label: 'Dekton' }] },
      { label: 'Главным акцентом должны быть прожилки', materials: [{ id: 'marble', label: 'Мрамор' }, { id: 'silestone', label: 'Silestone' }] },
    ],
    items: [
      { id: 'silestone', name: 'Silestone', image: '/images/materials/silestone/silestone-seaport.jpg', type: 'Минеральная поверхность Cosentino по технологии HybriQ+® из минералов и переработанных материалов.', look: 'Широкий выбор дизайнов: от спокойных однородных оттенков до выразительных прожилок.', consider: 'Производитель указывает устойчивость к бытовым пятнам, царапинам и ударам, но свойства зависят от продукта. Избегайте резкого температурного удара и следуйте инструкции для выбранной модели.' },
      { id: 'dekton', name: 'Dekton', image: '/images/materials/dekton/dekton-nolita.jpg', type: 'Ультракомпактная минеральная поверхность Cosentino, полученная спеканием минеральных частиц.', look: 'Разные дизайны под камень, бетон и другие материалы для визуально цельных больших поверхностей.', consider: 'Производитель заявляет устойчивость к пятнам, царапинам, жару и УФ-излучению. Для горячей посуды при длительном контакте рекомендуется подставка, особенно для тонких плит.' },
      { id: 'granite', name: 'Гранит', image: '/images/materials/granite/granite-charcoal.jpg', type: 'Природная магматическая порода; рисунок каждой плиты уникален.', look: 'Естественные вариации цвета и зерна. Плиту лучше выбирать вживую — рисунок не повторяется.', consider: 'Впитываемость и необходимость пропитки зависят от конкретного камня. Средства ухода и герметизацию подбирают под свойства плиты.' },
      { id: 'marble', name: 'Мрамор', image: '/images/materials/marble/marble-emperador.jpg', type: 'Природная метаморфическая порода, обычно содержащая кальцит.', look: 'Выразительные природные прожилки и переходы оттенков; каждая плита отличается.', consider: 'Кислоты, например лимон или уксус, могут оставить матовый след на мраморе с кальцитом. Он подойдёт тем, кто готов к бережному уходу и возможным следам эксплуатации.' },
    ],
  },
} satisfies Record<Locale, {
  eyebrow: string; title: string; intro: string; type: string; look: string; consider: string; link: string; note: string; priorityTitle: string; sources: string; sourceCosentino: string; sourceDekton: string; sourceStone: string;
  priorities: { label: string; materials: { id: string; label: string }[] }[];
  items: { id: string; name: string; image: string; type: string; look: string; consider: string }[];
}>

const featuredProjects = [projects[0], projects[1], projects[5]]

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  return {
    title: `LAGO — ${copy[l].title}`,
    description: copy[l].description,
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const l = locale as Locale
  const text = copy[l]
  const stoneBase = l === 'lv' ? 'akmens-virsmas' : l === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
  const furnitureBase = l === 'lv' ? 'mebeles' : l === 'ru' ? 'mebel' : 'furniture'
  const projectsBase = l === 'lv' ? 'projekti' : l === 'ru' ? 'proekty' : 'projects'
  const aboutBase = l === 'lv' ? 'par-mums' : l === 'ru' ? 'o-nas' : 'about-us'

  return (
    <>
      <section className="relative flex min-h-[88svh] items-center justify-center overflow-hidden bg-[#11100e] sm:min-h-screen">
        <div className="absolute inset-0">
          <HeroImageCarousel
            images={[
              '/images/furniture/ambiences-onirika-somnia-02.webp',
              '/images/furniture/ambiences-onirika-trance-01.webp',
              '/images/furniture/salon_11_header.webp',
              '/images/furniture/bathroom1.webp',
              '/images/furniture/bathroom2.webp',
              '/images/furniture/Kitchen1.webp',
            ]}
          />
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/65" />
        </div>
        <div className="container-lg relative z-10 px-5 pb-14 pt-28 text-center sm:pt-24">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.24em] text-[#e3c98f] sm:text-sm">{text.heroEyebrow}</p>
          <h1 className="mx-auto max-w-5xl font-heading text-5xl leading-[0.98] text-white sm:text-6xl md:text-7xl lg:text-8xl">{text.heroTitle}</h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">{text.heroBody}</p>
          <div className="home-hero-actions mt-9">
            <NeonButton href="#materials" variant="solid" size="lg" className="!bg-[#477c63]/90 hover:!bg-[#56866d] !text-white !border-emerald-100/45 hover:!border-emerald-100/70 hover:!shadow-emerald-900/30">{text.heroMaterials}<ArrowDown aria-hidden="true" className="ml-2 h-4 w-4" /></NeonButton>
            <NeonButton href={`/${l}/${projectsBase}`} variant="light" size="lg">{text.heroProjects}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></NeonButton>
          </div>
        </div>
        <p className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-white/70 md:block">LAGO · {text.since}</p>
      </section>

      <section id="offerings" className="bg-[#f4f1eb] px-5 py-20 text-[#24211d] sm:py-28">
        <div className="container-lg">
          <header className="mb-10 max-w-3xl sm:mb-14">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#947440]">{text.offeringsEyebrow}</p>
            <h2 className="font-heading text-4xl leading-tight text-[#24211d] text-shadow-none sm:text-5xl">{text.offeringsTitle}</h2>
          </header>
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
            <OfferingCard
              image="/images/projects/project-kitchen-1.webp"
              imageAlt={l === 'lv' ? 'Virtuve ar Silestone akmens virsmu' : l === 'en' ? 'Kitchen with a Silestone stone surface' : 'Кухня с каменной поверхностью Silestone'}
              index="01"
              title={text.stone}
              body={text.stoneBody}
              href={`/${l}/${stoneBase}`}
              linkText={text.explore}
            />
            <OfferingCard
              image="/images/projects/project-furniture-2.webp"
              imageAlt={l === 'lv' ? 'Individuāli veidotas iebūvējamās mēbeles' : l === 'en' ? 'Made-to-measure built-in furniture' : 'Встроенная мебель на заказ'}
              index="02"
              title={text.furniture}
              body={text.furnitureBody}
              href={`/${l}/${furnitureBase}`}
              linkText={text.explore}
            />
          </div>
        </div>
      </section>

      <section id="materials" className="bg-[#1b1916] px-5 py-20 text-white sm:py-28">
        <div className="container-lg">
          <header className="mb-9 max-w-3xl sm:mb-12">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#d5b777]">{materialGuide[l].eyebrow}</p>
            <h2 className="font-heading text-4xl leading-tight text-white text-shadow-none sm:text-5xl">{materialGuide[l].title}</h2>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">{materialGuide[l].intro}</p>
          </header>

          <div className="mb-12 border-y border-white/15 py-6 sm:mb-14 sm:py-7">
            <h3 className="mb-4 text-sm font-semibold text-[#e3c98f]">{materialGuide[l].priorityTitle}</h3>
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {materialGuide[l].priorities.map((priority) => (
                <li key={priority.label} className="min-h-16">
                  <p className="text-sm leading-5 text-white/85">{priority.label}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {priority.materials.map((option) => (
                      <Link key={option.id} href={`/${l}/${stoneBase}/${materialRoutes[option.id][l]}`} className="group inline-flex min-h-8 items-center gap-1 text-xs text-[#e3c98f] underline decoration-[#d5b777]/40 underline-offset-4 hover:decoration-[#d5b777] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5b777]">
                        {option.label}<ArrowUpRight aria-hidden="true" className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {materialGuide[l].items.map((material, index) => (
              <article key={material.id} className="min-w-0 border border-white/15 bg-[#24211d]">
                <div className="relative aspect-[1.6] overflow-hidden bg-[#302c27]">
                  <Image src={material.image} alt={`${material.name} surface sample`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover" />
                  <span className="absolute left-3 top-3 bg-[#1b1916]/90 px-2.5 py-1 text-xs tracking-wide text-white">0{index + 1}</span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="font-heading text-2xl text-white text-shadow-none">{material.name}</h3>
                  <dl className="mt-4 space-y-4 text-sm leading-5">
                    <div><dt className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d5b777]">{materialGuide[l].type}</dt><dd className="text-white/75">{material.type}</dd></div>
                    <div><dt className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d5b777]">{materialGuide[l].look}</dt><dd className="text-white/75">{material.look}</dd></div>
                    <div><dt className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d5b777]">{materialGuide[l].consider}</dt><dd className="text-white/75">{material.consider}</dd></div>
                  </dl>
                  <Link href={`/${l}/${stoneBase}/${materialRoutes[material.id][l]}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#e3c98f] underline decoration-[#d5b777]/50 underline-offset-4 hover:decoration-[#d5b777] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b777]">
                    {materialGuide[l].link}<ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl text-xs leading-5 text-white/55">{materialGuide[l].note}</p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60">
            <span>{materialGuide[l].sources}</span>
            <a href="https://www.cosentino.com/silestone/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">{materialGuide[l].sourceCosentino}</a>
            <a href="https://www.cosentino.com/usa/dekton/maintenance/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">{materialGuide[l].sourceDekton}</a>
            <a href="https://www.naturalstoneinstitute.org/consumers/care/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">{materialGuide[l].sourceStone}</a>
          </p>
        </div>
      </section>

      <section className="bg-[#f4f1eb] px-5 py-20 text-[#24211d] sm:py-28">
        <div className="container-lg">
          <div className="mb-10 flex items-end justify-between gap-5 sm:mb-14">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#947440]">{text.workEyebrow}</p>
              <h2 className="font-heading text-4xl leading-tight text-[#24211d] text-shadow-none sm:text-5xl">{text.workTitle}</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#625c52] sm:text-base">{text.workBody}</p>
            </div>
            <Link href={`/${l}/${projectsBase}`} className="hidden shrink-0 items-center gap-2 border-b border-[#9d8350] pb-1 text-sm font-medium text-[#4a3b22] transition-colors hover:text-[#947440] sm:inline-flex">{text.allProjects}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <Link key={project.id} href={`/${l}/${projectsBase}/${project.slug[l]}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#947440]">
                <div className={`relative overflow-hidden bg-[#ded9cf] ${index === 0 ? 'aspect-[1.1]' : 'aspect-[1.1]'}`}>
                  <Image src={project.heroImage} alt={project.title[l]} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                  <span className="absolute left-4 top-4 bg-[#f4f1eb] px-3 py-1 text-xs text-[#4b453b]">{project.quickFacts?.location?.[l] || project.location?.[l] || companyInfo.city}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <h3 className="font-heading text-2xl text-[#24211d] text-shadow-none">{project.title[l]}</h3>
                    <p className="mt-1 text-sm text-[#6c665c]">{project.year}</p>
                  </div>
                  <ArrowUpRight aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#947440] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
          <Link href={`/${l}/${projectsBase}`} className="mt-5 inline-flex items-center gap-2 border-b border-[#9d8350] pb-1 text-sm font-medium text-[#4a3b22] sm:hidden">{text.allProjects}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#24211d] px-5 py-20 text-white sm:py-24">
        <div className="container-lg">
          <div className="mb-10 max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#d5b777]">{text.processEyebrow}</p>
            <h2 className="font-heading text-4xl leading-tight text-white text-shadow-none sm:text-5xl">{text.processTitle}</h2>
          </div>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
            {[text.step1, text.step2, text.step3].map((step, index) => (
              <li key={step} className="border-t border-white/25 pt-4">
                <span className="text-xs tracking-[0.18em] text-[#d5b777]">0{index + 1}</span>
                <h3 className="mt-3 font-heading text-2xl text-white text-shadow-none">{step}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">{[text.step1Body, text.step2Body, text.step3Body][index]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="contact" className="bg-[#d9c394] px-5 py-16 text-[#25221c] sm:py-20">
        <div className="container-lg grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#594725]">{text.contactEyebrow}</p>
            <h2 className="max-w-3xl font-heading text-4xl leading-tight text-[#25221c] text-shadow-none sm:text-5xl">{text.contactTitle}</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#494237] sm:text-base">{text.contactBody}</p>
            <Link href={`/${l}/${aboutBase}#contact`} className="mt-7 inline-flex min-h-12 items-center gap-3 bg-[#24211d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#39342d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#24211d]">
              {text.contactCta}<ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <address className="grid gap-4 not-italic text-sm sm:grid-cols-2 lg:grid-cols-1 lg:justify-self-end lg:text-base">
            <a href={`tel:${companyInfo.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-3 hover:underline"><Phone aria-hidden="true" className="h-4 w-4" />{companyInfo.phone}</a>
            <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-3 hover:underline"><Mail aria-hidden="true" className="h-4 w-4" />{companyInfo.email}</a>
            <span className="flex items-center gap-3"><MapPin aria-hidden="true" className="h-4 w-4" />{companyInfo.address}, {text.address}</span>
            <span className="sm:col-span-2 lg:col-span-1">{companyInfo.workingHours[l]}</span>
          </address>
        </div>
      </section>
    </>
  )
}

function OfferingCard({ image, imageAlt, index, title, body, href, linkText }: {
  image: string
  imageAlt: string
  index: string
  title: string
  body: string
  href: string
  linkText: string
}) {
  return (
    <article className="grid min-h-full overflow-hidden bg-white md:grid-cols-[0.95fr_1.05fr]">
      <div className="relative min-h-64 md:min-h-80">
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 768px) 100vw, 24vw" className="object-cover" />
      </div>
      <div className="flex flex-col items-start p-6 sm:p-8 lg:p-9">
        <span className="text-xs tracking-[0.18em] text-[#947440]">{index}</span>
        <h3 className="mt-4 font-heading text-3xl leading-tight text-[#24211d] text-shadow-none sm:text-4xl">{title}</h3>
        <p className="mt-4 text-sm leading-6 text-[#625c52] sm:text-base">{body}</p>
        <Link href={href} className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-[#594725] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#947440]">
          {linkText}<ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
