// AGENT slave-8 v1.0.1 - Final optimization complete
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
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
import { ContactMap } from '@/components/ui/ContactMap'
import { AddressCard } from '@/components/ui/AddressCard'

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
    
    // Individual material pages (overview is now on homepage)
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
  return {
    title: `${slug?.join(' - ') || 'Page'} | LAGO`,
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
    // Redirect stone surfaces overview to homepage (materials section is now there)
    if (slug.length === 1) redirect(`/${l}#materials`)
    const material = materials.find(m => m.slug[l] === slug[1])
    if (material) return <MaterialDetailPage locale={l} material={material} />
  }
  
  if (slug[0] === furnitureBase) {
    if (slug.length === 1) return <FurniturePage locale={l} />
    const item = furniture.find(f => f.slug[l] === slug[1])
    if (item) return <FurnitureDetailPage locale={l} item={item} />
  }
  
  if (slug[0] === projectsBase) {
    if (slug.length === 1) return <ProjectsPage locale={l} />
    const project = projects.find(p => p.slug[l] === slug[1])
    if (project) return <ProjectDetailPage locale={l} project={project} />
  }
  
  if (slug[0] === aboutBase) return <AboutPage locale={l} />
  
  notFound()
}

// ===================== STONE SURFACES PAGE =====================
function StoneSurfacesPage({ locale }: { locale: Locale }) {
  const content = {
    title: { lv: 'Akmens virsmas', en: 'Stone Surfaces', ru: 'Каменные поверхности' },
    subtitle: {
      lv: 'Augstas kvalitātes akmens virsmas virtuvēm, vannas istabām un komerciālajiem objektiem.',
      en: 'High-quality stone surfaces for kitchens, bathrooms and commercial projects.',
      ru: 'Высококачественные каменные поверхности для кухонь, ванных комнат и коммерческих объектов.',
    },
    intro: {
      lv: 'Mēs piedāvājam plašu augstas kvalitātes akmens virsmu klāstu no pasaulē atzītiem ražotājiem. Katrs materiāls tiek rūpīgi atlasīts, lai nodrošinātu izturību, estētiku un funkcionalitāti.',
      en: 'We offer a wide range of high-quality stone surfaces from world-renowned manufacturers. Each material is carefully selected to ensure durability, aesthetics and functionality.',
      ru: 'Мы предлагаем широкий ассортимент высококачественных каменных поверхностей от всемирно известных производителей.',
    },
  }
  
  return (
    <>
      {/* Hero Section with animation */}
      <section className="relative pt-32 pb-20 bg-lago-dark overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container-lg relative z-10">
          <span className="text-lago-gold text-sm font-medium uppercase tracking-widest opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            {translations.nav.stoneSurfaces[locale]}
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mt-4 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            {content.title[locale]}
          </h1>
          <p className="text-lago-muted text-lg max-w-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {content.subtitle[locale]}
          </p>
          
          {/* Decorative line */}
          <div className="mt-10 w-24 h-[2px] bg-gradient-to-r from-lago-gold to-transparent animate-line-grow" style={{ animationDelay: '500ms' }} />
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-lago-black">
        <div className="container-lg">
          <p className="text-lago-light/80 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            {content.intro[locale]}
          </p>
        </div>
      </section>

      {/* Combined Material Selection Section */}
      <section className="py-24 bg-gradient-to-b from-lago-charcoal via-lago-dark to-lago-black relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl" />
        
        <div className="container-lg relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <span className="inline-block px-4 py-2 bg-lago-gold/10 text-lago-gold text-sm font-medium uppercase tracking-widest rounded-full mb-6">
              {locale === 'lv' ? 'Materiālu ceļvedis' : locale === 'en' ? 'Material Guide' : 'Руководство по материалам'}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6">
              {locale === 'lv' ? 'Izvēlieties ideālo materiālu' : locale === 'en' ? 'Choose Your Perfect Material' : 'Выберите идеальный материал'}
            </h2>
            <p className="text-lago-light text-lg max-w-2xl mx-auto">
              {locale === 'lv' ? 'Noklikšķiniet uz jebkura materiāla, lai uzzinātu vairāk un apskatītu krāsu opcijas' : locale === 'en' ? 'Click on any material to learn more and explore color options' : 'Нажмите на любой материал, чтобы узнать больше и увидеть варианты цветов'}
            </p>
          </div>

          {/* Material Cards - Interactive Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-20">
            {/* Silestone Card */}
            <Link
              href={`/${locale}/${locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'}/silestone`}
              className="group relative bg-lago-dark/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/10 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={getMaterialImage('silestone')}
                  alt="Silestone"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  // PERFORMANCE: Material detail pages - lazy load images below fold
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75} // PERFORMANCE: Reduced quality to save bandwidth
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lago-dark via-lago-dark/50 to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-lago-gold text-lago-black text-xs font-bold rounded-full animate-pulse-glow">
                  {locale === 'lv' ? 'POPULĀRĀKAIS' : locale === 'en' ? 'MOST POPULAR' : 'ПОПУЛЯРНЫЙ'}
                </div>
                
                {/* Rating Stars */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="flex text-lago-gold text-sm">★★★★★</div>
                  <span className="text-white/80 text-xs">{locale === 'lv' ? 'Vērtējums' : locale === 'en' ? 'Rating' : 'Рейтинг'}</span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-heading text-white group-hover:text-lago-gold transition-colors duration-300">
                    Silestone
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-lago-gold/10 flex items-center justify-center group-hover:bg-lago-gold group-hover:text-lago-black transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5 text-lago-gold group-hover:text-lago-black transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
                
                <p className="text-lago-light/80 mb-6 leading-relaxed">
                  {locale === 'lv' ? 'Kvarca virsmas ar revolucionāro HybriQ+ tehnoloģiju. Ideāli piemērots ikdienas lietošanai ar augstu izturību pret traipu un skrāpējumiem.' : locale === 'en' ? 'Quartz surfaces with revolutionary HybriQ+ technology. Perfect for everyday use with high stain and scratch resistance.' : 'Кварцевые поверхности с революционной технологией HybriQ+. Идеально для повседневного использования.'}
                </p>
                
                {/* Best For Section */}
                <div className="mb-6">
                  <span className="text-lago-gold text-xs font-medium uppercase tracking-wider mb-3 block">
                    {locale === 'lv' ? 'Ideāli piemērots:' : locale === 'en' ? 'Best for:' : 'Идеально для:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Virtuves' : locale === 'en' ? 'Kitchens' : 'Кухни'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Vannas istabas' : locale === 'en' ? 'Bathrooms' : 'Ванные'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Bāra letes' : locale === 'en' ? 'Bar counters' : 'Барные стойки'}
                    </span>
                  </div>
                </div>
                
                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'Antibakteriāls' : locale === 'en' ? 'Antibacterial' : 'Антибактериальный'}</span>
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? '25 gadu garantija' : locale === 'en' ? '25yr warranty' : '25 лет гарантии'}</span>
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'Izturīgs pret traipiem' : locale === 'en' ? 'Stain resistant' : 'Устойчив к пятнам'}</span>
                </div>
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-lago-gold/5 to-transparent" />
              </div>
            </Link>

            {/* Dekton Card */}
            <Link
              href={`/${locale}/${locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'}/dekton`}
              className="group relative bg-lago-dark/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/10 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={getMaterialImage('dekton')}
                  alt="Dekton"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75} // PERFORMANCE: Reduced quality to save bandwidth
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lago-dark via-lago-dark/50 to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full border border-white/30">
                  {locale === 'lv' ? 'ĀRAI + IEKŠTELPĀM' : locale === 'en' ? 'INDOOR + OUTDOOR' : 'ДЛЯ УЛИЦЫ'}
                </div>
                
                {/* Rating Stars */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="flex text-lago-gold text-sm">★★★★★</div>
                  <span className="text-white/80 text-xs">{locale === 'lv' ? 'Vērtējums' : locale === 'en' ? 'Rating' : 'Рейтинг'}</span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-heading text-white group-hover:text-lago-gold transition-colors duration-300">
                    Dekton
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-lago-gold/10 flex items-center justify-center group-hover:bg-lago-gold group-hover:text-lago-black transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5 text-lago-gold group-hover:text-lago-black transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
                
                <p className="text-lago-light/80 mb-6 leading-relaxed">
                  {locale === 'lv' ? 'Ultra-kompaktas virsmas āra un iekštelpu lietojumam. Maksimāla izturība pret UV stariem, karstumu un skrāpējumiem.' : locale === 'en' ? 'Ultra-compact surfaces for indoor and outdoor use. Maximum UV, heat and scratch resistance.' : 'Ультракомпактные поверхности для внутреннего и наружного использования.'}
                </p>
                
                {/* Best For Section */}
                <div className="mb-6">
                  <span className="text-lago-gold text-xs font-medium uppercase tracking-wider mb-3 block">
                    {locale === 'lv' ? 'Ideāli piemērots:' : locale === 'en' ? 'Best for:' : 'Идеально для:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Āra virtuves' : locale === 'en' ? 'Outdoor kitchens' : 'Уличные кухни'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Fasādes' : locale === 'en' ? 'Facades' : 'Фасады'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Grīdas' : locale === 'en' ? 'Flooring' : 'Полы'}
                    </span>
                  </div>
                </div>
                
                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'UV izturīgs' : locale === 'en' ? 'UV resistant' : 'Устойчив к УФ'}</span>
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'Karstumizturīgs' : locale === 'en' ? 'Heat proof' : 'Термостойкий'}</span>
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'Ultra-kompakts' : locale === 'en' ? 'Ultra-compact' : 'Ультракомпактный'}</span>
                </div>
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-lago-gold/5 to-transparent" />
              </div>
            </Link>

            {/* Granite Card */}
            <Link
              href={`/${locale}/${locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'}/${locale === 'lv' ? 'granits' : locale === 'ru' ? 'granit' : 'granite'}`}
              className="group relative bg-lago-dark/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/10 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={getMaterialImage('granite')}
                  alt={locale === 'lv' ? 'Granīts' : locale === 'en' ? 'Granite' : 'Гранит'}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75} // PERFORMANCE: Reduced quality to save bandwidth
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lago-dark via-lago-dark/50 to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full border border-white/30">
                  {locale === 'lv' ? 'DABĪGS AKMENS' : locale === 'en' ? 'NATURAL STONE' : 'НАТУРАЛЬНЫЙ'}
                </div>
                
                {/* Rating Stars */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="flex text-lago-gold text-sm">★★★★☆</div>
                  <span className="text-white/80 text-xs">{locale === 'lv' ? 'Vērtējums' : locale === 'en' ? 'Rating' : 'Рейтинг'}</span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-heading text-white group-hover:text-lago-gold transition-colors duration-300">
                    {locale === 'lv' ? 'Granīts' : locale === 'en' ? 'Granite' : 'Гранит'}
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-lago-gold/10 flex items-center justify-center group-hover:bg-lago-gold group-hover:text-lago-black transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5 text-lago-gold group-hover:text-lago-black transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
                
                <p className="text-lago-light/80 mb-6 leading-relaxed">
                  {locale === 'lv' ? 'Dabīgais akmens ar unikālu rakstu. Mūžīga klasika, kas piešķir interjeram eleganci un dabisko skaistumu.' : locale === 'en' ? 'Natural stone with unique patterns. Timeless classic that adds elegance and natural beauty to any interior.' : 'Натуральный камень с уникальным рисунком. Вечная классика.'}
                </p>
                
                {/* Best For Section */}
                <div className="mb-6">
                  <span className="text-lago-gold text-xs font-medium uppercase tracking-wider mb-3 block">
                    {locale === 'lv' ? 'Ideāli piemērots:' : locale === 'en' ? 'Best for:' : 'Идеально для:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Klasiskās virtuves' : locale === 'en' ? 'Classic kitchens' : 'Классические кухни'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Palodzes' : locale === 'en' ? 'Window sills' : 'Подоконники'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Kāpnes' : locale === 'en' ? 'Stairs' : 'Лестницы'}
                    </span>
                  </div>
                </div>
                
                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'Unikāls raksts' : locale === 'en' ? 'Unique pattern' : 'Уникальный рисунок'}</span>
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'Ilgmūžīgs' : locale === 'en' ? 'Long-lasting' : 'Долговечный'}</span>
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? '100% dabīgs' : locale === 'en' ? '100% natural' : '100% натуральный'}</span>
                </div>
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-lago-gold/5 to-transparent" />
              </div>
            </Link>

            {/* Marble Card */}
            <Link
              href={`/${locale}/${locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'}/${locale === 'lv' ? 'marmors' : locale === 'ru' ? 'mramor' : 'marble'}`}
              className="group relative bg-lago-dark/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/10 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={getMaterialImage('marble')}
                  alt={locale === 'lv' ? 'Marmors' : locale === 'en' ? 'Marble' : 'Мрамор'}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75} // PERFORMANCE: Reduced quality to save bandwidth
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lago-dark via-lago-dark/50 to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-lago-gold to-lago-gold-light text-lago-black text-xs font-bold rounded-full">
                  {locale === 'lv' ? 'PREMIUM' : locale === 'en' ? 'PREMIUM' : 'ПРЕМИУМ'}
                </div>
                
                {/* Rating Stars */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="flex text-lago-gold text-sm">★★★★★</div>
                  <span className="text-white/80 text-xs">{locale === 'lv' ? 'Luksuss' : locale === 'en' ? 'Luxury' : 'Люкс'}</span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-heading text-white group-hover:text-lago-gold transition-colors duration-300">
                    {locale === 'lv' ? 'Marmors' : locale === 'en' ? 'Marble' : 'Мрамор'}
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-lago-gold/10 flex items-center justify-center group-hover:bg-lago-gold group-hover:text-lago-black transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5 text-lago-gold group-hover:text-lago-black transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
                
                <p className="text-lago-light/80 mb-6 leading-relaxed">
                  {locale === 'lv' ? 'Luksusa dabīgais akmens ar izsmalcinātu estētiku. Ideāls ekskluzīviem interjera risinājumiem, kas prasa augstāko kvalitāti.' : locale === 'en' ? 'Luxury natural stone with refined aesthetics. Perfect for exclusive interior solutions that demand the highest quality.' : 'Роскошный натуральный камень с изысканной эстетикой. Идеально для эксклюзивных интерьеров.'}
                </p>
                
                {/* Best For Section */}
                <div className="mb-6">
                  <span className="text-lago-gold text-xs font-medium uppercase tracking-wider mb-3 block">
                    {locale === 'lv' ? 'Ideāli piemērots:' : locale === 'en' ? 'Best for:' : 'Идеально для:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Luksus vannas' : locale === 'en' ? 'Luxury baths' : 'Люкс ванные'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Kamīni' : locale === 'en' ? 'Fireplaces' : 'Камины'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-sm rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-lago-gold" />
                      {locale === 'lv' ? 'Akcent sienas' : locale === 'en' ? 'Feature walls' : 'Акцентные стены'}
                    </span>
                  </div>
                </div>
                
                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'Ekskluzīvs' : locale === 'en' ? 'Exclusive' : 'Эксклюзивный'}</span>
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'Klasiska elegance' : locale === 'en' ? 'Timeless' : 'Вневременной'}</span>
                  <span className="px-3 py-1 bg-lago-gold/10 text-lago-gold text-xs rounded-full font-medium">{locale === 'lv' ? 'Premium izskats' : locale === 'en' ? 'Premium look' : 'Премиум вид'}</span>
                </div>
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-lago-gold/5 to-transparent" />
              </div>
            </Link>
          </div>

          {/* Quick Comparison Table */}
          <div className="bg-lago-dark/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-lago-gold/10 to-transparent">
              <h3 className="text-2xl font-heading text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-lago-gold/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-lago-gold" />
                </span>
                {locale === 'lv' ? 'Ātrais salīdzinājums' : locale === 'en' ? 'Quick Comparison' : 'Быстрое сравнение'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-lago-charcoal/50">
                    <th className="text-left p-5 text-lago-muted font-medium">{locale === 'lv' ? 'Īpašība' : locale === 'en' ? 'Property' : 'Свойство'}</th>
                    <th className="text-center p-5 text-lago-gold font-semibold">Silestone</th>
                    <th className="text-center p-5 text-lago-gold font-semibold">Dekton</th>
                    <th className="text-center p-5 text-lago-gold font-semibold">{locale === 'lv' ? 'Granīts' : locale === 'en' ? 'Granite' : 'Гранит'}</th>
                    <th className="text-center p-5 text-lago-gold font-semibold">{locale === 'lv' ? 'Marmors' : locale === 'en' ? 'Marble' : 'Мрамор'}</th>
                  </tr>
                </thead>
                <tbody className="text-lago-light">
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-5 font-medium">{locale === 'lv' ? 'Karstumizturība' : locale === 'en' ? 'Heat Resistance' : 'Термостойкость'}</td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★</span><span className="text-lago-stone">☆</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★★</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★</span><span className="text-lago-stone">☆</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★</span><span className="text-lago-stone">☆☆</span></td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-5 font-medium">{locale === 'lv' ? 'Skrāpējumu izturība' : locale === 'en' ? 'Scratch Resistance' : 'Устойчивость к царапинам'}</td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★★</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★★</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★</span><span className="text-lago-stone">☆</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★</span><span className="text-lago-stone">☆☆</span></td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-5 font-medium">{locale === 'lv' ? 'Traipu izturība' : locale === 'en' ? 'Stain Resistance' : 'Устойчивость к пятнам'}</td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★★</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★★</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★</span><span className="text-lago-stone">☆☆</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★</span><span className="text-lago-stone">☆☆☆</span></td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-5 font-medium">{locale === 'lv' ? 'Kopšanas vienkāršība' : locale === 'en' ? 'Easy Maintenance' : 'Легкость ухода'}</td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★★</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★★</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★</span><span className="text-lago-stone">☆</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★</span><span className="text-lago-stone">☆☆</span></td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-5 font-medium">{locale === 'lv' ? 'Āra lietošana' : locale === 'en' ? 'Outdoor Use' : 'Использование на улице'}</td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★</span><span className="text-lago-stone">☆☆☆</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★★</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★★★</span><span className="text-lago-stone">☆</span></td>
                    <td className="text-center p-5"><span className="text-lago-gold">★★</span><span className="text-lago-stone">☆☆☆</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="p-6 bg-lago-charcoal/30 border-t border-white/5">
              <p className="text-lago-muted text-sm text-center">
                {locale === 'lv' ? '★ = zems · ★★★ = vidējs · ★★★★★ = augsts' : locale === 'en' ? '★ = low · ★★★ = medium · ★★★★★ = high' : '★ = низкий · ★★★ = средний · ★★★★★ = высокий'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-lago-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="container-lg relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              {locale === 'lv' ? 'Nepieciešama palīdzība izvēlē?' : locale === 'en' ? 'Need help choosing?' : 'Нужна помощь в выборе?'}
            </h2>
            <p className="text-lago-muted mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              {locale === 'lv' ? 'Mūsu speciālisti labprāt palīdzēs izvēlēties piemērotāko materiālu.' : locale === 'en' ? 'Our specialists will help you choose the right material.' : 'Наши специалисты помогут выбрать подходящий материал.'}
            </p>
            <NeonButton
              href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}
              variant="solid"
              size="lg"
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              <Phone className="w-5 h-5" />
              {locale === 'lv' ? 'Sazināties' : locale === 'en' ? 'Contact Us' : 'Связаться'}
            </NeonButton>
          </div>
        </div>
      </section>
    </>
  )
}

// ===================== MATERIAL DETAIL PAGE =====================
function MaterialDetailPage({ locale, material }: { locale: Locale; material: typeof materials[0] }) {
  const features = [
    { lv: 'Augsta izturība pret skrāpējumiem', en: 'High scratch resistance', ru: 'Высокая устойчивость к царапинам' },
    { lv: 'Izturīgs pret karstumu', en: 'Heat resistant', ru: 'Термостойкость' },
    { lv: 'Viegli tīrāms', en: 'Easy to clean', ru: 'Легко чистится' },
    { lv: 'Plašs krāsu klāsts', en: 'Wide color range', ru: 'Широкая цветовая гамма' },
  ]
  
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
  const content = {
    title: { lv: 'Par mums', en: 'About Us', ru: 'О нас' },
    subtitle: {
      lv: 'LAGO Stone & Furniture - premium akmens virsmu un mēbeļu ražotājs Latvijā kopš 2003. gada.',
      en: 'LAGO Stone & Furniture - premium stone surface and furniture manufacturer in Latvia since 2003.',
      ru: 'LAGO Stone & Furniture - производитель премиальных каменных поверхностей и мебели с 2003 года.',
    },
    story: {
      lv: 'Mēs esam uzņēmums ar ilggadēju pieredzi akmens virsmu un mēbeļu ražošanā. Mūsu komanda apvieno labākās tradīcijas ar modernām tehnoloģijām, lai radītu produktus, kas ir ne tikai skaisti, bet arī praktiski un izturīgi.',
      en: 'We are a company with many years of experience in stone surface and furniture manufacturing. Our team combines the best traditions with modern technologies to create products that are not only beautiful but also practical and durable.',
      ru: 'Мы компания с многолетним опытом производства каменных поверхностей и мебели. Наша команда сочетает лучшие традиции с современными технологиями.',
    },
  }
  
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={images.workshop}
            alt="LAGO workshop"
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
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            {content.title[locale]}
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 bg-lago-black">
        <div className="container-lg">
          <div className="max-w-3xl">
            <p className="text-lago-gold text-xl mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              {content.subtitle[locale]}
            </p>
            <p className="text-lago-light/80 text-lg leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              {content.story[locale]}
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-lago-dark relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        
        <div className="container-lg relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6">
              {locale === 'lv' ? 'Kontakti' : locale === 'en' ? 'Contact Us' : 'Контакты'}
            </h2>
            <p className="text-lago-light text-lg max-w-2xl mx-auto">
              {locale === 'lv' 
                ? 'Mēs esam gatavi atbildēt uz jūsu jautājumiem un palīdzēt izvēlēties ideālo risinājumu jūsu projektam.'
                : locale === 'en'
                ? 'We are ready to answer your questions and help you choose the perfect solution for your project.'
                : 'Мы готовы ответить на ваши вопросы и помочь выбрать идеальное решение для вашего проекта.'}
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Address Card - Clickable with popup */}
            <AddressCard 
              locale={locale}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            />
            
            {/* Phone Card */}
            <div 
              className="group relative p-8 rounded-2xl bg-lago-charcoal/50 backdrop-blur-sm border border-white/10 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/20 hover:-translate-y-2 opacity-0 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-lago-gold/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className="relative w-16 h-16 rounded-xl bg-lago-gold/10 flex items-center justify-center mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Phone className="w-8 h-8 text-lago-gold" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-lago-gold/10 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </div>
              
              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-heading text-white mb-2 group-hover:text-lago-gold transition-colors duration-300">
                  {locale === 'lv' ? 'Tālrunis' : locale === 'en' ? 'Phone' : 'Телефон'}
                </h3>
                <p className="text-lago-muted text-sm mb-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  {locale === 'lv' ? 'Zvaniet mums jebkurā laikā' : locale === 'en' ? 'Call us anytime' : 'Звоните нам в любое время'}
                </p>
                <a 
                  href={`tel:${companyInfo.phone.replace(/[^\d+]/g, '')}`}
                  className="text-lago-light text-lg font-medium hover:text-lago-gold transition-colors duration-300 inline-flex items-center gap-2 group/link"
                >
                  {companyInfo.phone}
                  <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                </a>
              </div>
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lago-gold/0 group-hover:border-lago-gold/50 transition-colors duration-300 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lago-gold/0 group-hover:border-lago-gold/50 transition-colors duration-300 rounded-br-2xl" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>

            {/* Email Card */}
            <div 
              className="group relative p-8 rounded-2xl bg-lago-charcoal/50 backdrop-blur-sm border border-white/10 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/20 hover:-translate-y-2 opacity-0 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className="relative w-16 h-16 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Mail className="w-8 h-8 text-purple-400" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-purple-500/10 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </div>
              
              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-heading text-white mb-2 group-hover:text-lago-gold transition-colors duration-300">
                  {locale === 'lv' ? 'E-pasts' : locale === 'en' ? 'Email' : 'Email'}
                </h3>
                <p className="text-lago-muted text-sm mb-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  {locale === 'lv' ? 'Rakstiet mums e-pastu' : locale === 'en' ? 'Send us an email' : 'Напишите нам письмо'}
                </p>
                <a 
                  href={`mailto:${companyInfo.email}`}
                  className="text-lago-light text-lg font-medium hover:text-lago-gold transition-colors duration-300 inline-flex items-center gap-2 group/link"
                >
                  {companyInfo.email}
                  <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                </a>
              </div>
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lago-gold/0 group-hover:border-lago-gold/50 transition-colors duration-300 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lago-gold/0 group-hover:border-lago-gold/50 transition-colors duration-300 rounded-br-2xl" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <ContactMap locale={locale} />
          </div>
        </div>
      </section>
    </>
  )
}
