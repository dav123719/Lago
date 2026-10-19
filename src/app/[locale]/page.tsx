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
    explore: 'Uzzināt vairāk', materialsEyebrow: 'Materiāli', materialsTitle: 'Izvēlieties materiālu pēc tā rakstura', materialsBody: 'Iepazīstiet četrus virsmu veidus un apskatiet materiālu piemērus.',
    silestone: 'Kvarca virsmas dažādām telpām.', dekton: 'Ultra-kompaktas virsmas iekštelpām un ārtelpām.', granite: 'Dabīgais akmens ar katram blokam unikālu rakstu.', marble: 'Dabīgais akmens ar izteiksmīgu dzīslu zīmējumu.',
    viewMaterial: 'Apskatīt materiālu', workEyebrow: 'LAGO darbi', workTitle: 'Īstenoti projekti', workBody: 'Akmens un mēbeles dažādām telpām — apskatiet, kā materiāli strādā reālos projektos.', allProjects: 'Visi projekti',
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
    explore: 'Explore the service', materialsEyebrow: 'Materials', materialsTitle: 'Choose a material by its character', materialsBody: 'Learn about four surface types and view material examples.',
    silestone: 'Quartz surfaces for a range of interiors.', dekton: 'Ultra-compact surfaces for indoor and outdoor use.', granite: 'Natural stone with a pattern unique to each piece.', marble: 'Natural stone with expressive veining.',
    viewMaterial: 'Explore material', workEyebrow: 'LAGO projects', workTitle: 'Made for real spaces', workBody: 'Stone and furniture for a range of interiors. See how the materials come together in completed projects.', allProjects: 'View all projects',
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
    explore: 'Подробнее', materialsEyebrow: 'Материалы', materialsTitle: 'Выберите материал по его характеру', materialsBody: 'Познакомьтесь с четырьмя видами поверхностей и примерами материалов.',
    silestone: 'Кварцевые поверхности для разных интерьеров.', dekton: 'Ультракомпактные поверхности для помещений и улицы.', granite: 'Натуральный камень с уникальным рисунком каждого слэба.', marble: 'Натуральный камень с выразительными прожилками.',
    viewMaterial: 'Подробнее о материале', workEyebrow: 'Проекты LAGO', workTitle: 'Решения для реальных пространств', workBody: 'Камень и мебель для разных интерьеров. Посмотрите, как материалы сочетаются в готовых проектах.', allProjects: 'Все проекты',
    processEyebrow: 'От идеи до установки', processTitle: 'Понятный путь к готовому решению',
    step1: 'Обсуждаем идею', step1Body: 'Уточняем потребности помещения и ваши пожелания.',
    step2: 'Выбираем материал', step2Body: 'Знакомимся с материалами и выбираем подходящий вариант.',
    step3: 'Изготавливаем и устанавливаем', step3Body: 'Изготавливаем поверхности или мебель и устанавливаем их в помещении.',
    since: 'В Латвии с 2003 года', contactEyebrow: 'Начнём разговор', contactTitle: 'Расскажите о своём проекте', contactBody: 'Свяжитесь с LAGO по поводу каменных поверхностей или мебели на заказ, чтобы обсудить следующий шаг.', contactCta: 'Обсудить проект', address: 'Рига, Латвия', hours: 'Пн–Пт 9:00–18:00 · Сб по договорённости',
  },
} satisfies Record<Locale, Record<string, string>>

const materialImages = [
  { id: 'silestone', title: { lv: 'Silestone', en: 'Silestone', ru: 'Silestone' }, image: '/images/materials/silestone/silestone-seaport.jpg' },
  { id: 'dekton', title: { lv: 'Dekton', en: 'Dekton', ru: 'Dekton' }, image: '/images/materials/dekton/dekton-nolita.jpg' },
  { id: 'granite', title: { lv: 'Granīts', en: 'Granite', ru: 'Гранит' }, image: '/images/materials/granite/granite-charcoal.jpg' },
  { id: 'marble', title: { lv: 'Marmors', en: 'Marble', ru: 'Мрамор' }, image: '/images/materials/marble/marble-emperador.jpg' },
] as const

const materialRoutes: Record<string, Record<Locale, string>> = {
  silestone: { lv: 'silestone', en: 'silestone', ru: 'silestone' },
  dekton: { lv: 'dekton', en: 'dekton', ru: 'dekton' },
  granite: { lv: 'granits', en: 'granite', ru: 'granit' },
  marble: { lv: 'marmors', en: 'marble', ru: 'mramor' },
}

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
            <NeonButton href="#materials" variant="solid" size="lg">{text.heroMaterials}<ArrowDown aria-hidden="true" className="ml-2 h-4 w-4" /></NeonButton>
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
          <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#d5b777]">{text.materialsEyebrow}</p>
              <h2 className="font-heading text-4xl leading-tight text-white text-shadow-none sm:text-5xl">{text.materialsTitle}</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/65 sm:text-base">{text.materialsBody}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {materialImages.map((material) => {
              const name = material.title[l]
              return (
                <Link key={material.id} href={`/${l}/${stoneBase}/${materialRoutes[material.id][l]}`} className="group min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d5b777]">
                  <div className="relative aspect-[0.92] overflow-hidden bg-[#302c27] sm:aspect-[0.82]">
                    <Image src={material.image} alt={name} fill sizes="(max-width: 640px) 46vw, (max-width: 1024px) 45vw, 23vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                    <h3 className="font-heading text-xl text-white text-shadow-none sm:text-2xl">{name}</h3>
                      <span className="mt-1 hidden text-sm leading-5 text-white/75 sm:block">{text[material.id as keyof typeof text]}</span>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#e3c98f] sm:text-sm">{text.viewMaterial}<ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
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
