export const dynamicParams = false
// AGENT slave-8 v1.0.1 - Final optimization complete
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ChevronRight, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react'
import { NeonButton } from '@/components/ui/NeonButton'
import { Locale, locales } from '@/lib/i18n/config'
import { translations } from '@/lib/i18n/translations'
import { materials } from '@/content/materials'
import { furnitureTypes as furniture } from '@/content/furniture'
import { projects } from '@/content/projects'
import { companyInfo } from '@/content/company'
import { ProjectsPage } from '@/components/pages/ProjectsPage'
import { MaterialProjectsSection } from '@/components/pages/MaterialProjectsSection'
import { ContactInquiryForm } from '@/components/pages/ContactInquiryForm'

interface PageProps {
  params: Promise<{ locale: string; slug: string[] }>
}

// Local images from the original lago.lv website
const images = {
  kitchen1: '/images/materials/silestone/silestone-seaport.jpg',
  kitchen2: '/images/materials/dekton/dekton-nolita.jpg',
  marble: '/images/materials/marble/marble-emperador.jpg',
  granite: '/images/materials/granite/granite-charcoal.jpg',
  bathroom: '/images/furniture/interior/bathroom-faro.jpg',
  furniture: '/images/furniture/kitchens/kitchen-1.jpg',
  interior: '/images/furniture/interior/interior-sink.jpg',
  project1: '/images/projects/project-1.jpg',
  project2: '/images/projects/project-2.jpg',
  project3: '/images/projects/project-3.jpg',
  about: '/images/hero/hero-desert-silver.jpg',
  workshop: '/images/furniture/kitchens/kitchen-2.jpg',
}

// Helper function to get material image
function getMaterialImage(materialId: string): string {
  const imageMap: Record<string, string> = {
    silestone: images.kitchen1,
    dekton: images.kitchen2,
    granite: images.granite,
    marble: images.marble,
  }
  return imageMap[materialId] || images.kitchen1
}

export async function generateStaticParams() {
  const paths: { locale: string; slug: string[] }[] = []
  
  for (const locale of locales) {
    const stoneBase = locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
    const furnitureBase = locale === 'lv' ? 'mebeles' : locale === 'ru' ? 'mebel' : 'furniture'
    const projectsBase = locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'
    const aboutBase = locale === 'lv' ? 'par-mums' : locale === 'ru' ? 'o-nas' : 'about-us'
    
    // Keep the overview and individual material pages indexable.
    paths.push({ locale, slug: [stoneBase] })
    for (const material of materials) {
      paths.push({ locale, slug: [stoneBase, material.slug[locale]] })
    }
    
    paths.push({ locale, slug: [furnitureBase] })
    for (const item of furniture) {
      paths.push({ locale, slug: [furnitureBase, item.slug[locale]] })
    }
    
    paths.push({ locale, slug: [projectsBase] })
    for (const project of projects) {
      paths.push({ locale, slug: [projectsBase, project.slug[locale]] })
    }
    
    paths.push({ locale, slug: [aboutBase] })
  }
  
  return paths
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const l = locale as Locale
  const stoneBase = l === 'lv' ? 'akmens-virsmas' : l === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
  const furnitureBase = l === 'lv' ? 'mebeles' : l === 'ru' ? 'mebel' : 'furniture'
  const aboutBase = l === 'lv' ? 'par-mums' : l === 'ru' ? 'o-nas' : 'about-us'
  const material = slug[0] === stoneBase && slug.length === 2
    ? materials.find((item) => item.slug[l] === slug[1])
    : undefined
  const furnitureItem = slug[0] === furnitureBase && slug.length === 2
    ? furniture.find((item) => item.slug[l] === slug[1])
    : undefined

  const alternatePath = (target: Locale) => {
    const targetStoneBase = target === 'lv' ? 'akmens-virsmas' : target === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
    const targetFurnitureBase = target === 'lv' ? 'mebeles' : target === 'ru' ? 'mebel' : 'furniture'
    const targetAboutBase = target === 'lv' ? 'par-mums' : target === 'ru' ? 'o-nas' : 'about-us'
    if (slug[0] === stoneBase) return `/${target}/${targetStoneBase}${material ? `/${material.slug[target]}` : ''}/`
    if (slug[0] === furnitureBase) return `/${target}/${targetFurnitureBase}${furnitureItem ? `/${furnitureItem.slug[target]}` : ''}/`
    if (slug[0] === aboutBase) return `/${target}/${targetAboutBase}/`
    return `/${target}/${slug.join('/')}/`
  }

  let title = 'Akmens virsmas un mēbeles pēc pasūtījuma'
  let description = 'LAGO izgatavo un uzstāda akmens virsmas un mēbeles pēc pasūtījuma Latvijā.'
  if (slug[0] === stoneBase && !material) {
    const copy = {
      lv: ['Akmens virsmas virtuvēm un vannas istabām', 'Salīdziniet Silestone, Dekton, granītu un marmoru virtuves virsmām, vannas istabām un sienu paneļiem. LAGO izgatavo un uzstāda risinājumus Latvijā.'],
      en: ['Stone surfaces for kitchens and bathrooms', 'Compare Silestone, Dekton, granite and marble for kitchen worktops, bathrooms and wall panels. LAGO makes and installs custom solutions in Latvia.'],
      ru: ['Каменные поверхности для кухни и ванной', 'Сравните Silestone, Dekton, гранит и мрамор для кухни, ванной и стеновых панелей. LAGO изготавливает и устанавливает поверхности в Латвии.'],
    }[l]
    ;[title, description] = copy
  } else if (material) {
    const materialNames = {
      silestone: { lv: 'Silestone', en: 'Silestone', ru: 'Silestone' },
      dekton: { lv: 'Dekton', en: 'Dekton', ru: 'Dekton' },
      granite: { lv: 'Granīts', en: 'Granite', ru: 'Гранит' },
      marble: { lv: 'Marmors', en: 'Marble', ru: 'Мрамор' },
    }[material.id]
    title = `${materialNames?.[l] || material.name[l]} — ${l === 'lv' ? 'virsmu ceļvedis' : l === 'ru' ? 'гид по поверхностям' : 'surface guide'}`
    description = material.description[l]
  } else if (slug[0] === furnitureBase) {
    title = furnitureItem?.name[l] || (l === 'lv' ? 'Mēbeles pēc pasūtījuma' : l === 'ru' ? 'Мебель на заказ' : 'Custom furniture')
    description = furnitureItem?.description[l] || (l === 'lv' ? 'Virtuves un iebūvējamās mēbeles pēc pasūtījuma, pielāgotas telpai un saskaņotas ar akmens virsmām.' : l === 'ru' ? 'Кухни и встроенная мебель на заказ, адаптированные к помещению и каменным поверхностям.' : 'Made-to-measure kitchens and built-in furniture, planned for the room and coordinated with stone surfaces.')
  } else if (slug[0] === aboutBase) {
    title = l === 'lv' ? 'Par LAGO — akmens virsmas un mēbeles kopš 2003. gada' : l === 'ru' ? 'О LAGO — каменные поверхности и мебель с 2003 года' : 'About LAGO — stone surfaces and furniture since 2003'
    description = l === 'lv' ? 'Uzziniet par LAGO darbu, akmens virsmu izgatavošanu un individuālām mēbelēm Latvijā.' : l === 'ru' ? 'Узнайте о работе LAGO, изготовлении каменных поверхностей и мебели на заказ в Латвии.' : 'Learn about LAGO, its custom stone surface fabrication and made-to-measure furniture in Latvia.'
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/${l}/${slug.join('/')}/`,
      languages: { lv: alternatePath('lv'), en: alternatePath('en'), ru: alternatePath('ru'), 'x-default': alternatePath('lv') },
    },
    openGraph: { type: 'website', title, description, url: `https://lago.lv/${l}/${slug.join('/')}/` },
  }
}

export default async function CatchAllPage({ params }: PageProps) {
  const { locale, slug } = await params
  const l = locale as Locale
  
  const stoneBase = l === 'lv' ? 'akmens-virsmas' : l === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
  const furnitureBase = l === 'lv' ? 'mebeles' : l === 'ru' ? 'mebel' : 'furniture'
  const projectsBase = l === 'lv' ? 'projekti' : l === 'ru' ? 'proekty' : 'projects'
  const aboutBase = l === 'lv' ? 'par-mums' : l === 'ru' ? 'o-nas' : 'about-us'
  
  if (slug[0] === stoneBase) {
    if (slug.length === 1) return <StoneSurfacesPage locale={l} />
    const material = materials.find(m => m.slug[l] === slug[1])
    if (slug.length === 2 && material) return <MaterialDetailPage locale={l} material={material} />
  }
  
  if (slug[0] === furnitureBase) {
    if (slug.length === 1) return <FurniturePage locale={l} />
    const item = furniture.find(f => f.slug[l] === slug[1])
    if (slug.length === 2 && item) return <FurnitureDetailPage locale={l} item={item} />
  }
  
  if (slug[0] === projectsBase) {
    if (slug.length === 1) return <ProjectsPage locale={l} />
    const project = projects.find(p => p.slug[l] === slug[1])
    if (slug.length === 2 && project) return <ProjectDetailPage locale={l} project={project} />
  }
  
  if (slug.length === 1 && slug[0] === aboutBase) return <AboutPage locale={l} />
  
  notFound()
}

// ===================== APPLICATIONS & MATERIAL GUIDE =====================
function StoneSurfacesPage({ locale }: { locale: Locale }) {
  const base = locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
  const projectBase = locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'
  const materialPaths: Record<string, string> = {
    silestone: 'silestone',
    dekton: 'dekton',
    granite: locale === 'lv' ? 'granits' : locale === 'ru' ? 'granit' : 'granite',
    marble: locale === 'lv' ? 'marmors' : locale === 'ru' ? 'mramor' : 'marble',
  }
  const copy = {
    lv: {
      eyebrow: 'Virsmu ceļvedis', title: 'Sāciet ar telpu. Materiālu izvēlieties pēc tam.',
      intro: 'LAGO izgatavo un uzstāda pēc pasūtījuma veidotas akmens virsmas virtuvēm un interjeriem. Apskatiet, kur virsma tiks izmantota, un salīdziniet materiālu izskatu un kopšanu.',
      appsTitle: 'Kur virsma tiks izmantota?', kitchen: 'Virtuves darba virsmas', kitchenBody: 'Darba zona, sala un sienas panelis var veidot vienotu risinājumu. Izvēloties, apsveriet ikdienas gatavošanu, vēlamo rakstu un to, kādu kopšanu pieņemat.', bathroom: 'Vannas istabas virsmas', bathroomBody: 'Izlietņu virsmas un sienu apdare ļauj izvēlēties starp dabisku raksta variāciju un vienotāku dizainu. Apsveriet mitrumu, tīrīšanas līdzekļus un izvēlētā akmens kopšanas norādes.', panels: 'Sienu paneļi un apdare', panelsBody: 'Virtuves un vannas istabas sienu paneļus var saskaņot ar darba virsmu. Piemērotība ir atkarīga no konkrētā materiāla, apdares un uzstādījuma.',
      projects: 'Piemērs no LAGO projekta', seeProject: 'Apskatīt projektu', furnitureTitle: 'Meklējat arī mēbeles?', furnitureBody: 'LAGO izgatavo virtuves un iebūvējamās mēbeles, ko var saskaņot ar akmens virsmu.', furnitureLink: 'Apskatīt mēbeles',
      compareTitle: 'Kā atšķiras materiāli?', compareIntro: 'Sāciet ar izskatu un ikdienas kopšanu. Izturība un norādes ir atkarīgas no konkrētās kolekcijas, plāksnes, apdares un biezuma.', look: 'Izskats', care: 'Ikdienā ņemiet vērā', silestoneLook: 'Plaša dizainu izvēle — no mierīgiem toņiem līdz izteiktām dzīslām.', silestoneCare: 'Cosentino norāda izturību pret ikdienas traipiem un skrāpējumiem konkrētās produktu līnijās. Sargājiet no strauja karstuma trieciena un ievērojiet produkta kopšanas norādes.', dektonLook: 'Dažādi akmens un citu virsmu dizaini.', dektonCare: 'Ražotājs norāda izturību pret traipiem, karstumu un UV, taču malām var kaitēt trieciens. Ilgstošam karstumam un plānākām plāksnēm izmantojiet paliktni.', graniteLook: 'Dabīgs magmatisks akmens; katras plāksnes minerālu raksts ir atšķirīgs.', graniteCare: 'Uzsūkšana un vajadzība pēc impregnēšanas mainās atkarībā no konkrētā akmens. Izvēlieties un apskatiet pašu plāksni.', marbleLook: 'Dabiskas dzīslas un toņu pārejas; neatkārtojams raksts.', marbleCare: 'Skābi produkti var iegravēt kalcītu saturošu marmoru. Izvēlieties, ja pieņemat saudzīgāku kopšanu un lietojuma pēdas.', details: 'Materiāla informācija', note: 'Šis ir sākumpunkts, nevis garantija par katru plāksni. Pirms pasūtījuma LAGO pārbaudīs izvēlētā produkta un plāksnes ražotāja lietošanas un kopšanas nosacījumus. Cena tiek aprēķināta pēc projekta.', contact: 'Pārrunāt savu projektu', sources: 'Ražotāju un nozares kopšanas informācija:', silestoneSource: 'Cosentino: Silestone', dektonSource: 'Cosentino: Dekton kopšana', stoneSource: 'Natural Stone Institute: akmens kopšana',
    },
    en: {
      eyebrow: 'Surface guide', title: 'Start with the room. Choose the material next.',
      intro: 'LAGO makes and installs made-to-measure stone surfaces for kitchens and interiors. Start with where the surface will be used, then compare appearance and care.',
      appsTitle: 'Where will the surface go?', kitchen: 'Kitchen worktops', kitchenBody: 'The work area, island and wall panel can form one coordinated solution. Consider how you cook, the look you want and the level of care you are comfortable with.', bathroom: 'Bathroom surfaces', bathroomBody: 'Vanity tops and wall finishes let you choose between natural variation and a more consistent design. Consider moisture, cleaning products and the care guidance for the selected stone.', panels: 'Wall panels and cladding', panelsBody: 'Kitchen and bathroom wall panels can be coordinated with a worktop. Suitability depends on the specific material, finish and installation.',
      projects: 'From a LAGO project', seeProject: 'View project', furnitureTitle: 'Planning furniture too?', furnitureBody: 'LAGO makes kitchens and built-ins that can be coordinated with a stone surface.', furnitureLink: 'Explore furniture',
      compareTitle: 'How do the materials differ?', compareIntro: 'Start with appearance and everyday care. Performance and guidance depend on the specific collection, slab, finish and thickness.', look: 'Appearance', care: 'In everyday use', silestoneLook: 'A broad design range, from quieter tones to expressive veining.', silestoneCare: 'Cosentino describes resistance to everyday stains and scratches for specific product lines. Protect it from thermal shock and follow the product care guide.', dektonLook: 'A range of stone and other surface designs.', dektonCare: 'The manufacturer describes resistance to stains, heat and UV, though edges can be damaged by impact. Use a trivet for prolonged heat and thinner slabs.', graniteLook: 'Natural igneous stone; the mineral pattern varies from slab to slab.', graniteCare: 'Absorption and the need for sealing vary by stone. View and choose the actual slab.', marbleLook: 'Natural veining and shifts in tone; every slab has a distinct pattern.', marbleCare: 'Acids can etch calcite-bearing marble. Choose it if you are comfortable with gentler care and signs of use.', details: 'Material details', note: 'Use this as a starting point, not a guarantee for every slab. Before ordering, LAGO will confirm the use and care guidance for the selected product and slab. Pricing is quoted for each project.', contact: 'Discuss your project', sources: 'Manufacturer and industry care guidance:', silestoneSource: 'Cosentino: Silestone', dektonSource: 'Cosentino: Dekton care', stoneSource: 'Natural Stone Institute: stone care',
    },
    ru: {
      eyebrow: 'Гид по поверхностям', title: 'Начните с помещения. Материал выберете позже.',
      intro: 'LAGO изготавливает и устанавливает каменные поверхности на заказ для кухонь и интерьеров. Сначала определите назначение поверхности, затем сравните внешний вид и уход.',
      appsTitle: 'Где будет использоваться поверхность?', kitchen: 'Кухонные столешницы', kitchenBody: 'Рабочая зона, остров и стеновая панель могут стать единым решением. Учитывайте повседневную готовку, желаемый рисунок и приемлемый для вас уход.', bathroom: 'Поверхности для ванной', bathroomBody: 'Столешницы для умывальников и отделка стен позволяют выбрать природный рисунок или более однородный дизайн. Учитывайте влажность, средства для уборки и рекомендации для выбранного камня.', panels: 'Стеновые панели и отделка', panelsBody: 'Панели для кухни и ванной можно сочетать со столешницей. Подходящий вариант зависит от материала, отделки и способа монтажа.',
      projects: 'Пример проекта LAGO', seeProject: 'Посмотреть проект', furnitureTitle: 'Также нужна мебель?', furnitureBody: 'LAGO изготавливает кухни и встроенную мебель, которые можно сочетать с каменной поверхностью.', furnitureLink: 'Мебель на заказ',
      compareTitle: 'Чем отличаются материалы?', compareIntro: 'Начните с внешнего вида и повседневного ухода. Свойства зависят от коллекции, плиты, отделки и толщины.', look: 'Внешний вид', care: 'В повседневном использовании', silestoneLook: 'Широкий выбор дизайнов: от спокойных оттенков до выразительных прожилок.', silestoneCare: 'Cosentino указывает устойчивость к бытовым пятнам и царапинам для отдельных линеек. Избегайте резкого перепада температуры и следуйте инструкции по уходу.', dektonLook: 'Разные дизайны под камень и другие поверхности.', dektonCare: 'Производитель указывает устойчивость к пятнам, жару и УФ, однако края можно повредить ударом. Для длительного нагрева и тонких плит используйте подставку.', graniteLook: 'Природная магматическая порода; рисунок каждой плиты отличается.', graniteCare: 'Впитываемость и необходимость пропитки зависят от конкретного камня. Выбирайте и осматривайте саму плиту.', marbleLook: 'Природные прожилки и переходы оттенков; каждая плита уникальна.', marbleCare: 'Кислоты могут оставить матовый след на мраморе с кальцитом. Выбирайте его, если готовы к бережному уходу и следам использования.', details: 'Подробнее о материале', note: 'Это отправная точка, а не гарантия для каждой плиты. Перед заказом LAGO уточнит рекомендации по использованию и уходу для выбранного продукта и плиты. Стоимость рассчитывается для каждого проекта.', contact: 'Обсудить проект', sources: 'Рекомендации производителей и отрасли по уходу:', silestoneSource: 'Cosentino: Silestone', dektonSource: 'Cosentino: уход за Dekton', stoneSource: 'Natural Stone Institute: уход за камнем',
    },
  }[locale]

  const applications = [
    { id: 'kitchen-worktops', title: copy.kitchen, body: copy.kitchenBody, projectId: 'modern-kitchen-jurmala', image: '/images/projects/project-kitchen-1.webp' },
    { id: 'bathroom-surfaces', title: copy.bathroom, body: copy.bathroomBody, projectId: 'hotel-bathroom-riga', image: '/images/projects/project-bathroom-1.webp' },
    { id: 'wall-panels', title: copy.panels, body: copy.panelsBody, projectId: 'private-bathroom-pardaugava', image: '/images/projects/project-bathroom-2.webp' },
  ]
  const comparison = [
    { id: 'silestone', title: 'Silestone', look: copy.silestoneLook, care: copy.silestoneCare },
    { id: 'dekton', title: 'Dekton', look: copy.dektonLook, care: copy.dektonCare },
    { id: 'granite', title: locale === 'lv' ? 'Granīts' : locale === 'ru' ? 'Гранит' : 'Granite', look: copy.graniteLook, care: copy.graniteCare },
    { id: 'marble', title: locale === 'lv' ? 'Marmors' : locale === 'ru' ? 'Мрамор' : 'Marble', look: copy.marbleLook, care: copy.marbleCare },
  ]

  return (
    <>
      <section className="relative overflow-hidden bg-lago-dark px-5 pb-14 pt-32 sm:pb-20">
        <div className="container-lg relative z-10">
          <Link href={`/${locale}`} className="text-sm text-lago-gold underline underline-offset-4">LAGO</Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-lago-gold">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-heading text-4xl leading-tight text-white sm:text-6xl">{copy.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-lago-light/75 sm:text-lg">{copy.intro}</p>
          <a href="#applications" className="mt-8 inline-flex min-h-12 items-center gap-2 bg-lago-gold px-5 font-semibold text-lago-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lago-gold">
            {copy.appsTitle}<ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section id="applications" className="scroll-mt-24 bg-[#f4f1eb] px-5 py-16 text-[#24211d] sm:py-24">
        <div className="container-lg">
          <h2 className="font-heading text-3xl text-[#24211d] text-shadow-none sm:text-4xl">{copy.appsTitle}</h2>
          <div className="mt-8 grid gap-6 lg:gap-10">
            {applications.map((application) => {
              const project = projects.find((item) => item.id === application.projectId)
              if (!project) return null
              return (
                <article id={application.id} key={application.id} className="scroll-mt-28 grid overflow-hidden border border-[#d9d3c8] bg-white md:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative min-h-64 bg-[#ddd7cc] md:min-h-96">
                    <Image src={application.image} alt={`${project.title[locale]}: ${application.title}`} fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover" />
                  </div>
                  <div className="flex flex-col items-start p-6 sm:p-9">
                    <h3 className="font-heading text-3xl text-[#24211d] text-shadow-none">{application.title}</h3>
                    <p className="mt-4 max-w-2xl leading-7 text-[#625c52]">{application.body}</p>
                    <div className="mt-6 border-l-2 border-[#b89b62] pl-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#80683d]">{copy.projects}</p>
                      <p className="mt-2 font-medium text-[#24211d]">{project.title[locale]}</p>
                      <p className="mt-1 text-sm leading-6 text-[#625c52]">{project.summary[locale]}</p>
                      <Link href={`/${locale}/${projectBase}/${project.slug[locale]}`} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#594725] underline underline-offset-4">
                        {copy.seeProject}<ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="mt-8 flex flex-col items-start gap-4 border-t border-[#d5cec1] pt-7 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="font-heading text-2xl text-[#24211d] text-shadow-none">{copy.furnitureTitle}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#625c52]">{copy.furnitureBody}</p></div>
            <Link href={`/${locale}/${locale === 'lv' ? 'mebeles' : locale === 'ru' ? 'mebel' : 'furniture'}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-[#594725] underline underline-offset-4">{copy.furnitureLink}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section id="material-comparison" className="scroll-mt-24 bg-[#1b1916] px-5 py-16 text-white sm:py-24">
        <div className="container-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d5b777]">{copy.eyebrow}</p>
          <h2 className="mt-3 max-w-3xl font-heading text-3xl text-white text-shadow-none sm:text-4xl">{copy.compareTitle}</h2>
          <p className="mt-4 max-w-3xl leading-7 text-white/70">{copy.compareIntro}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {comparison.map((material) => (
              <article key={material.id} className="flex flex-col border border-white/15 bg-[#24211d] p-5 sm:p-6">
                <h3 className="font-heading text-2xl text-white text-shadow-none">{material.title}</h3>
                <dl className="mt-4 space-y-4 text-sm leading-6">
                  <div><dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#d5b777]">{copy.look}</dt><dd className="text-white/75">{material.look}</dd></div>
                  <div><dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#d5b777]">{copy.care}</dt><dd className="text-white/75">{material.care}</dd></div>
                </dl>
                <Link href={`/${locale}/${base}/${materialPaths[material.id]}`} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-[#e3c98f] underline underline-offset-4">
                  {copy.details}<ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl text-xs leading-5 text-white/60">{copy.note}</p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/65">
            <span>{copy.sources}</span>
            <a href="https://www.cosentino.com/silestone/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">{copy.silestoneSource}</a>
            <a href="https://www.cosentino.com/en-gb/dekton/maintenance/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">{copy.dektonSource}</a>
            <a href="https://www.naturalstoneinstitute.org/consumers/care/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">{copy.stoneSource}</a>
          </p>
          <Link href={`/${locale}/${locale === 'lv' ? 'par-mums' : locale === 'ru' ? 'o-nas' : 'about-us'}#contact`} className="mt-8 inline-flex min-h-12 items-center gap-2 bg-[#d9c394] px-5 font-semibold text-[#25221c] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d9c394]">
            {copy.contact}<ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

// ===================== MATERIAL DETAIL PAGE =====================
function MaterialDetailPage({ locale, material }: { locale: Locale; material: typeof materials[0] }) {
  const featuresByMaterial: Record<typeof material.id, Record<Locale, string>[]> = {
    silestone: [
      { lv: 'Cosentino zīmola minerālu virsmu saime', en: 'A family of Cosentino-branded mineral surfaces', ru: 'Семейство минеральных поверхностей бренда Cosentino' },
      { lv: 'Sastāvs un ražošanas tehnoloģija atšķiras pēc produktu līnijas', en: 'Composition and manufacturing technology vary by product line', ru: 'Состав и технология производства зависят от линейки продукта' },
      { lv: 'Ražotājs norāda izturību pret traipiem un skrāpējumiem atsevišķām līnijām', en: 'Manufacturer describes stain and scratch resistance for specific lines', ru: 'Производитель указывает устойчивость к пятнам и царапинам для отдельных линеек' },
      { lv: 'Sargāt no strauja karstuma trieciena; lietot paliktni un sekot kopšanas norādēm', en: 'Protect from thermal shock, use a trivet and follow product care guidance', ru: 'Защищать от резкого перепада температуры, использовать подставку и следовать инструкции' },
    ],
    dekton: [
      { lv: 'Ultra-kompakta minerālu virsma', en: 'Ultra-compact mineral surface', ru: 'Ультракомпактная минеральная поверхность' },
      { lv: 'Ražotājs norāda izturību pret UV starojumu', en: 'Manufacturer describes UV resistance', ru: 'Производитель указывает устойчивость к УФ-излучению' },
      { lv: 'Ražotājs norāda izturību pret traipiem, skrāpējumiem un karstumu; malas var bojāt trieciens', en: 'Manufacturer describes resistance to stains, scratches and heat; edges can be damaged by impact', ru: 'Производитель указывает устойчивость к пятнам, царапинам и жару; края можно повредить ударом' },
      { lv: 'Ilgstošam karstumam izmantot paliktni; izvairīties no tiešas liesmas', en: 'Use a trivet for prolonged heat; avoid direct flame', ru: 'При длительном нагреве использовать подставку; избегать открытого огня' },
    ],
    granite: [
      { lv: 'Dabīgs magmatisks akmens', en: 'Natural igneous stone', ru: 'Природная магматическая порода' },
      { lv: 'Raksts un minerālu graudi atšķiras katrā plāksnē', en: 'Pattern and mineral grain vary from slab to slab', ru: 'Рисунок и минеральное зерно различаются у каждой плиты' },
      { lv: 'Uzsūkšana un cietība atšķiras pēc konkrētā akmens', en: 'Absorption and hardness vary by stone', ru: 'Впитываемость и твёрдость зависят от конкретного камня' },
      { lv: 'Impregnēšanu un kopšanu nosaka pēc izvēlētās plāksnes', en: 'Choose sealing and care for the selected slab', ru: 'Пропитку и уход подбирают для выбранной плиты' },
    ],
    marble: [
      { lv: 'Dabīgs metamorfais akmens ar neatkārtojamām dzīslām', en: 'Natural metamorphic stone with distinctive veining', ru: 'Природная метаморфическая порода с выразительными прожилками' },
      { lv: 'Daudzi marmori satur kalcītu', en: 'Many marbles contain calcite', ru: 'Многие виды мрамора содержат кальцит' },
      { lv: 'Skābes var iegravēt kalcītu saturošu virsmu', en: 'Acids can etch calcite-bearing marble', ru: 'Кислоты могут оставить травление на мраморе с кальцитом' },
      { lv: 'Konkrētā akmens kopšanu pārrunāt pirms izvēles', en: 'Discuss care for the specific stone before choosing', ru: 'Обсудить уход за конкретным камнем до выбора' },
    ],
  }
  const features = featuresByMaterial[material.id]
  
  return (
    <>
      {/* Hero with parallax effect */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={getMaterialImage(material.id)}
            alt={material.name[locale]}
            fill
            // PERFORMANCE: Material hero image - prioritize only if above fold
            priority={false}
            loading="lazy"
            sizes="100vw"
            quality={80} // PERFORMANCE: Reduced quality for hero images
            className="object-cover scale-110 animate-scale-in"
            style={{ animationDuration: '1.5s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lago-black via-lago-black/60 to-lago-black/20" />
        </div>
        
        <div className="relative container-lg pb-20 pt-40">
          <span className="text-lago-gold text-sm font-medium uppercase tracking-widest opacity-0 animate-fade-in-left" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {translations.nav.stoneSurfaces[locale]}
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-heading text-white mt-4 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            {material.name[locale]}
          </h1>
          <p className="text-lago-light/80 text-xl max-w-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            {material.description[locale]}
          </p>
        </div>
      </section>

      {/* Features with icons */}
      <section className="py-20 bg-lago-black">
        <div className="container-lg">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="opacity-0 animate-fade-in-left" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <h2 className="text-3xl md:text-4xl font-heading text-white mb-6">
                {locale === 'lv' ? 'Par materiālu' : locale === 'en' ? 'About the material' : 'О материале'}
              </h2>
              <p className="text-lago-muted leading-relaxed text-lg">
                {material.longDescription?.[locale] || material.description[locale]}
              </p>
            </div>
            
            <div className="opacity-0 animate-fade-in-right" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <h2 className="text-3xl md:text-4xl font-heading text-white mb-6">
                {locale === 'lv' ? 'Priekšrocības' : locale === 'en' ? 'Benefits' : 'Преимущества'}
              </h2>
              <ul className="space-y-5">
                {features.map((feature, i) => (
                  <li 
                    key={i} 
                    className="flex items-center gap-4 text-lago-light/80 p-4 rounded-lg bg-lago-charcoal/50 hover:bg-lago-charcoal transition-colors duration-300 opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${500 + i * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-lago-gold flex-shrink-0" />
                    <span className="text-lg">{feature[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <MaterialProjectsSection locale={locale} material={material} />

      {/* CTA */}
      <section className="py-24 bg-lago-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lago-gold/5 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="container-lg text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-heading text-white mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            {locale === 'lv' ? 'Pieprasīt piedāvājumu' : locale === 'en' ? 'Request a quote' : 'Запросить предложение'}
          </h2>
          <p className="text-lago-muted mb-8 max-w-xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            {locale === 'lv' ? 'Sazinieties ar mums bezmaksas konsultācijai.' : locale === 'en' ? 'Contact us for a free consultation.' : 'Свяжитесь с нами для бесплатной консультации.'}
          </p>
          <NeonButton
            href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}
            variant="solid"
            size="xl"
            className="animate-pulse-glow opacity-0 animate-fade-in-up"
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            <Phone className="w-5 h-5" />
            {companyInfo.phone}
          </NeonButton>
        </div>
      </section>
    </>
  )
}

// ===================== FURNITURE PAGE =====================
function FurniturePage({ locale }: { locale: Locale }) {
  const content = {
    title: { lv: 'Mēbeles', en: 'Furniture', ru: 'Мебель' },
    subtitle: {
      lv: 'Individuāli projektētas virtuves mēbeles, iebūvējamās mēbeles un interjera risinājumi.',
      en: 'Custom designed kitchen furniture, built-in furniture and interior solutions.',
      ru: 'Кухонная мебель на заказ, встроенная мебель и интерьерные решения.',
    },
  }
  
  const furnitureImages: Record<string, string> = {
    kitchens: images.kitchen1,
    'built-in': images.furniture,
    'interior-projects': images.interior,
  }
  
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-lago-dark overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container-lg relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            {content.title[locale]}
          </h1>
          <p className="text-lago-muted text-lg max-w-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {content.subtitle[locale]}
          </p>
        </div>
      </section>

      {/* Furniture Grid */}
      <section className="py-20 bg-lago-black">
        <div className="container-lg">
          <div className="grid md:grid-cols-3 gap-6">
            {furniture.map((item, index) => (
              <Link
                key={item.id}
                href={`/${locale}/${locale === 'lv' ? 'mebeles' : locale === 'ru' ? 'mebel' : 'furniture'}/${item.slug[locale]}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg card-tilt opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${400 + index * 150}ms`, animationFillMode: 'forwards' }}
              >
                <Image
                  src={furnitureImages[item.id] || images.furniture}
                  alt={item.name[locale]}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lago-black via-lago-black/30 to-transparent" />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-heading text-white mb-2 group-hover:text-lago-gold transition-all duration-300 transform group-hover:translate-y-[-8px]">
                    {item.name[locale]}
                  </h3>
                  <p className="text-lago-light/70 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {item.description[locale]}
                  </p>
                </div>
                
                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-lago-gold/0 group-hover:border-lago-gold transition-colors duration-300" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-lago-gold/0 group-hover:border-lago-gold transition-colors duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

// ===================== FURNITURE DETAIL PAGE =====================
function FurnitureDetailPage({ locale, item }: { locale: Locale; item: typeof furniture[0] }) {
  const furnitureImages: Record<string, string> = {
    kitchens: images.kitchen1,
    'built-in': images.furniture,
    'interior-projects': images.interior,
  }
  
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={furnitureImages[item.id] || images.furniture}
            alt={item.name[locale]}
            fill
            // PERFORMANCE: Below fold images - lazy load to reduce initial payload
            priority={false}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={85}
            className="object-cover animate-scale-in"
            style={{ animationDuration: '1.2s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lago-black via-lago-black/60 to-transparent" />
        </div>
        
        <div className="relative container-lg pb-16 pt-40">
          <span className="text-lago-gold text-sm font-medium uppercase tracking-widest opacity-0 animate-fade-in-left" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            {translations.nav.furniture[locale]}
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {item.name[locale]}
          </h1>
        </div>
      </section>

      {/* Description */}
      <section className="py-24 bg-lago-black">
        <div className="container-lg">
          <div className="max-w-3xl opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <p className="text-lago-light/80 text-xl leading-relaxed">
              {item.longDescription?.[locale] || item.description[locale]}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-lago-dark">
        <div className="container-lg text-center">
          <h2 className="text-3xl font-heading text-white mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            {locale === 'lv' ? 'Sākt projektu' : locale === 'en' ? 'Start a project' : 'Начать проект'}
          </h2>
          <NeonButton
            href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}
            variant="solid"
            size="lg"
            className="opacity-0 animate-fade-in-up"
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            <Phone className="w-5 h-5" />
            {companyInfo.phone}
          </NeonButton>
        </div>
      </section>
    </>
  )
}


// ===================== PROJECT DETAIL PAGE =====================
import { ProjectDetailHero, QuickFacts, StorySection, MaterialsDetails, ProjectGallery } from '@/components/pages/project-detail'

function ProjectDetailPage({ locale, project }: { locale: Locale; project: typeof projects[0] }) {
  return (
    <>
      {/* (A) Hero / Overview */}
      <ProjectDetailHero project={project} locale={locale} />

      {/* (B) Quick Facts & Materials */}
      <QuickFacts project={project} locale={locale} />

      {/* (C) Story: goal → solution */}
      <StorySection project={project} locale={locale} />

      {/* (E) Gallery with clean material labeling */}
      <ProjectGallery project={project} locale={locale} />

      {/* Back link */}
      <section className="py-12 bg-lago-dark border-t border-white/5">
        <div className="container-lg">
          <Link
            href={`/${locale}/${locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'}`}
            className="group inline-flex items-center gap-2 text-lago-gold hover:text-lago-gold-light transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180 transform group-hover:-translate-x-2 transition-transform" />
            {locale === 'lv' ? 'Atpakaļ uz projektiem' : locale === 'en' ? 'Back to projects' : 'Назад к проектам'}
          </Link>
        </div>
      </section>
    </>
  )
}

// ===================== ABOUT PAGE =====================
function AboutPage({ locale }: { locale: Locale }) {
  const copy = {
    lv: {
      title: 'Par LAGO', eyebrow: 'Akmens virsmas un individuālas mēbeles',
      intro: 'LAGO ražo akmens virsmas un individuālas mēbeles Latvijā kopš 2003. gada. Mēs apvienojam materiāla izvēli, izgatavošanu un uzstādīšanu, lai risinājums atbilstu konkrētajai telpai un tās lietojumam.',
      capabilities: 'No materiāla izvēles līdz gatavam risinājumam',
      steps: [
        ['01', 'Izrunājam ieceri', 'Pastāstiet par telpu, vajadzībām un vēlamo rezultātu.'],
        ['02', 'Izvēlamies materiālu', 'Salīdziniet Silestone, Dekton un dabīgā akmens iespējas.'],
        ['03', 'Izgatavojam un uzstādām', 'Projektā var ietilpt virsmas, paneļi, izlietnes un mēbeles.'],
      ],
      work: 'Darbs, ko var apskatīt', project: 'Moderna virtuve Jūrmalā', projectMeta: 'Silestone Eternal Calacatta Gold · 8 m² · izgatavošana un uzstādīšana', projectCta: 'Apskatīt projektu',
      contactEyebrow: 'Sāksim ar jūsu projektu', contactTitle: 'Sazinieties ar LAGO',
      contactIntro: 'Aprakstiet ieceri pa tālruni vai e-pastā. Varat arī apmeklēt mūs Rīgā darba laikā; sestdienās — pēc iepriekšējas pieteikšanās.',
      address: 'Adrese', phone: 'Tālrunis', email: 'E-pasts', hours: 'Darba laiks', directions: 'Atvērt kartē', call: 'Zvanīt', write: 'Rakstīt e-pastu',
    },
    en: {
      title: 'About LAGO', eyebrow: 'Stone surfaces and custom furniture',
      intro: 'LAGO has made stone surfaces and custom furniture in Latvia since 2003. We bring material selection, fabrication and installation together so each solution fits its space and how it will be used.',
      capabilities: 'From material selection to a finished space',
      steps: [
        ['01', 'Talk through the idea', 'Tell us about the room, your needs and the result you have in mind.'],
        ['02', 'Choose a material', 'Compare Silestone, Dekton and natural stone options.'],
        ['03', 'Fabricate and install', 'A project can include countertops, panels, sinks and furniture.'],
      ],
      work: 'A project to explore', project: 'Modern Kitchen in Jurmala', projectMeta: 'Silestone Eternal Calacatta Gold · 8 m² · fabrication and installation', projectCta: 'View the project',
      contactEyebrow: 'Start with your project', contactTitle: 'Talk to LAGO',
      contactIntro: 'Tell us about your plans by phone or email. You can also visit us in Riga during business hours; Saturdays are by appointment.',
      address: 'Address', phone: 'Phone', email: 'Email', hours: 'Opening hours', directions: 'Open directions', call: 'Call', write: 'Send an email',
    },
    ru: {
      title: 'О LAGO', eyebrow: 'Каменные поверхности и мебель на заказ',
      intro: 'LAGO производит каменные поверхности и мебель на заказ в Латвии с 2003 года. Мы объединяем подбор материала, изготовление и монтаж, чтобы решение подходило конкретному помещению и его использованию.',
      capabilities: 'От выбора материала до готового решения',
      steps: [
        ['01', 'Обсудим идею', 'Расскажите о помещении, потребностях и желаемом результате.'],
        ['02', 'Выберем материал', 'Сравните Silestone, Dekton и натуральный камень.'],
        ['03', 'Изготовим и установим', 'Проект может включать столешницы, панели, мойки и мебель.'],
      ],
      work: 'Пример проекта', project: 'Современная кухня в Юрмале', projectMeta: 'Silestone Eternal Calacatta Gold · 8 м² · изготовление и установка', projectCta: 'Посмотреть проект',
      contactEyebrow: 'Обсудим ваш проект', contactTitle: 'Свяжитесь с LAGO',
      contactIntro: 'Расскажите о планах по телефону или электронной почте. Также можно посетить нас в Риге в рабочее время; по субботам — по предварительной записи.',
      address: 'Адрес', phone: 'Телефон', email: 'Эл. почта', hours: 'Часы работы', directions: 'Открыть маршрут', call: 'Позвонить', write: 'Написать письмо',
    },
  }[locale]
  const projectPath = `/${locale}/${locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'}/${projects[0].slug[locale]}`
  const mapQuery = encodeURIComponent(`${companyInfo.address}, ${companyInfo.city}, ${companyInfo.postalCode}, ${companyInfo.country}`)

  return (
    <>
      <section className="relative min-h-[48vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={images.workshop}
            alt={locale === 'lv' ? 'LAGO mēbeļu un akmens virsmu projekts' : locale === 'en' ? 'LAGO furniture and stone surface project' : 'Проект мебели и каменных поверхностей LAGO'}
            fill
            sizes="100vw"
            quality={85}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-lago-black via-lago-black/75 to-lago-black/25" />
        </div>
        <div className="relative container-lg grid md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)] gap-8 items-end pb-16 pt-40">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-lago-gold mb-4">{copy.eyebrow}</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white">{copy.title}</h1>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 md:justify-self-end">{copy.intro}</p>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-lago-black">
        <div className="container-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-lago-gold mb-3">LAGO · 2003</p>
              <h2 className="text-3xl md:text-4xl font-heading text-white max-w-2xl">{copy.capabilities}</h2>
            </div>
            <Link href={`/${locale}/${locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'}/#material-comparison`} className="inline-flex items-center gap-2 text-lago-gold hover:text-white transition-colors font-medium">
              {locale === 'lv' ? 'Iepazīt materiālus' : locale === 'en' ? 'Explore materials' : 'Изучить материалы'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {copy.steps.map(([number, title, description]) => (
              <article key={number} className="rounded-2xl border border-white/10 bg-lago-charcoal/50 p-6 md:p-7">
                <p className="text-lago-gold font-heading text-3xl mb-8">{number}</p>
                <h3 className="text-xl text-white font-medium mb-3">{title}</h3>
                <p className="text-lago-light/70 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 md:py-24 bg-lago-dark relative scroll-mt-24">
        <div className="container-lg">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm uppercase tracking-[0.2em] text-lago-gold mb-4">{copy.contactEyebrow}</p>
              <h2 className="text-4xl md:text-5xl font-heading text-white mb-5">{copy.contactTitle}</h2>
              <p className="text-lago-light/75 leading-relaxed mb-8">{copy.contactIntro}</p>
              <div className="flex flex-wrap gap-3">
                <a href={`tel:${companyInfo.phone.replace(/[^\d+]/g, '')}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lago-gold px-5 text-lago-black font-semibold hover:bg-white transition-colors"><Phone className="w-4 h-4" />{copy.call}</a>
                <a href={`mailto:${companyInfo.email}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-white hover:border-lago-gold hover:text-lago-gold transition-colors"><Mail className="w-4 h-4" />{copy.write}</a>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <ContactInquiryForm locale={locale} />
              <article className="rounded-2xl border border-white/10 bg-lago-charcoal/50 p-6">
                <MapPin className="w-5 h-5 text-lago-gold mb-5" />
                <h3 className="text-lg font-medium text-white mb-2">{copy.address}</h3>
                <p className="text-lago-light/80 leading-relaxed">{companyInfo.address}<br />{companyInfo.city}, {companyInfo.postalCode}<br />{companyInfo.country}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-lago-gold hover:text-white transition-colors">{copy.directions}<ArrowUpRight className="w-4 h-4" /></a>
              </article>
              <article className="rounded-2xl border border-white/10 bg-lago-charcoal/50 p-6">
                <Phone className="w-5 h-5 text-lago-gold mb-5" />
                <h3 className="text-lg font-medium text-white mb-2">{copy.phone}</h3>
                <a href={`tel:${companyInfo.phone.replace(/[^\d+]/g, '')}`} className="text-lago-light/80 hover:text-lago-gold transition-colors">{companyInfo.phone}</a>
                <div className="h-px bg-white/10 my-5" />
                <h3 className="text-lg font-medium text-white mb-2">{copy.email}</h3>
                <a href={`mailto:${companyInfo.email}`} className="break-all text-lago-light/80 hover:text-lago-gold transition-colors">{companyInfo.email}</a>
              </article>
              <article className="sm:col-span-2 rounded-2xl border border-white/10 bg-lago-charcoal/50 p-6 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-lago-gold/10 flex items-center justify-center"><span className="text-lago-gold text-sm" aria-hidden="true">09–18</span></div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">{copy.hours}</h3>
                  <p className="text-lago-light/75">{companyInfo.workingHours[locale]}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-lago-black">
        <div className="container-lg grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 items-center rounded-3xl border border-white/10 bg-lago-charcoal/35 p-6 md:p-10">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={projects[0].heroImage} alt={projects[0].title[locale]} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="py-2 md:py-6">
            <p className="text-sm uppercase tracking-[0.2em] text-lago-gold mb-4">{copy.work}</p>
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-4">{copy.project}</h2>
            <p className="text-lago-light/70 leading-relaxed mb-7">{copy.projectMeta}</p>
            <Link href={projectPath} className="inline-flex items-center gap-2 text-lago-gold hover:text-white transition-colors font-medium">{copy.projectCta}<ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>
    </>
  )
}
