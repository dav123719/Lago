import { Metadata } from 'next'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Locale, locales } from '@/lib/i18n/config'
// PERFORMANCE: Lazy load below-the-fold components to reduce initial bundle size
import dynamic from 'next/dynamic'
import { NeonButton } from '@/components/ui/NeonButton'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { ScrollIndicator } from '@/components/ui/ScrollIndicator'
import { HeroImageCarousel } from '@/components/ui/HeroImageCarousel'
import { LogoWithGlow } from '@/components/ui/LogoWithGlow'

// PERFORMANCE: Lazy load heavy components that are below the fold to reduce initial JS bundle
const ProjectsCarousel = dynamic(() => import('@/components/ui/ProjectsCarousel').then(mod => ({ default: mod.ProjectsCarousel })), { 
  ssr: true,
  loading: () => <div className="h-96 bg-lago-charcoal/30 animate-pulse rounded-xl" />
})
const CustomFurnitureShowcase = dynamic(() => import('@/components/ui/CustomFurnitureShowcase').then(mod => ({ default: mod.CustomFurnitureShowcase })), { 
  ssr: true 
})
const CTALink = dynamic(() => import('@/components/ui/CTALink').then(mod => ({ default: mod.CTALink })), { 
  ssr: true 
})
const MaterialCardRefactored = dynamic(() => import('@/components/ui/MaterialCardRefactored').then(mod => ({ default: mod.MaterialCardRefactored })), { 
  ssr: true 
})
const ViewAllProjectsLink = dynamic(() => import('@/components/ui/ViewAllProjectsLink').then(mod => ({ default: mod.ViewAllProjectsLink })), { 
  ssr: true 
})

interface HomePageProps {
  params: Promise<{ locale: string }>
}

// Material card images
const images = {
  kitchen1: '/images/materials/silestone/silestone-seaport.jpg',
  kitchen2: '/images/materials/dekton/dekton-nolita.jpg',
  marble: '/images/materials/marble/marble-emperador.jpg',
  stone1: '/images/materials/granite/granite-charcoal.jpg',
}

// Content
const content = {
  hero: {
    tagline: {
      lv: 'Akmens virsmas & Mēbeles',
      en: 'Stone Surfaces & Furniture',
      ru: 'Каменные поверхности и мебель',
    },
    title: {
      lv: 'Radām virsmas, kas iedvesmo',
      en: 'Creating surfaces that inspire',
      ru: 'Создаём поверхности, которые вдохновляют',
    },
    subtitle: {
      lv: 'Premium Silestone, Dekton, granīta un marmora virsmas jūsu sapņu virtuvei un interjeram.',
      en: 'Premium Silestone, Dekton, granite and marble surfaces for your dream kitchen and interior.',
      ru: 'Премиальные поверхности Silestone, Dekton, гранита и мрамора для кухни и интерьера вашей мечты.',
    },
  },
}

// Helper to get material slugs
function getMaterialUrl(locale: Locale, material: string): string {
  const slugs: Record<string, Record<Locale, string>> = {
    silestone: { lv: 'silestone', en: 'silestone', ru: 'silestone' },
    dekton: { lv: 'dekton', en: 'dekton', ru: 'dekton' },
    granite: { lv: 'granits', en: 'granite', ru: 'granit' },
    marble: { lv: 'marmors', en: 'marble', ru: 'mramor' },
  }
  const base = locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
  return `/${locale}/${base}/${slugs[material][locale]}`
}


export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale

  const titles = {
    lv: 'LAGO - Premium akmens virsmas un mēbeles',
    en: 'LAGO - Premium Stone Surfaces & Furniture',
    ru: 'LAGO - Премиальные каменные поверхности и мебель',
  }

  return {
    title: titles[l],
    description: content.hero.subtitle[l],
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const l = locale as Locale

  const projectsUrl = `/${l}/${l === 'lv' ? 'projekti' : l === 'ru' ? 'proekty' : 'projects'}`

  return (
    <>
      {/* Hero Section - Full height to hide features initially */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Carousel */}
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
            interval={5000}
          />
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute inset-0 bg-grid opacity-30" />
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(10,10,10,0.4)_100%)]" />
        </div>
        

        {/* Content */}
        <div className="relative container-lg text-center pt-20">
          <div className="max-w-4xl mx-auto">
            {/* Tagline */}
            <div className="animate-fade-in-down opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 glass-light rounded-full text-sm text-lago-gold mb-8 group hover:bg-white/10 transition-all duration-300 cursor-default">
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                {content.hero.tagline[l]}
              </span>
            </div>

            {/* Main heading */}
            <h1 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading text-white leading-none mb-8 animate-fade-in-up opacity-0"
              style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
            >
              {content.hero.title[l]}
            </h1>

            {/* Subtitle */}
            <p 
              className="text-lg md:text-xl text-lago-light/70 max-w-2xl mx-auto mb-12 animate-fade-in-up opacity-0"
              style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
            >
              {content.hero.subtitle[l]}
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up opacity-0"
              style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
            >
              <NeonButton href="#materials" variant="solid" size="lg">
                {l === 'lv' ? 'Izpētīt materiālus' : l === 'en' ? 'Explore Materials' : 'Изучить материалы'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </NeonButton>
              <NeonButton href={projectsUrl} variant="light" size="lg">
                {l === 'lv' ? 'Mūsu projekti' : l === 'en' ? 'Our Projects' : 'Наши проекты'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </NeonButton>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <ScrollIndicator locale={l} />
      </section>

      {/* Custom Furniture & Stone Solutions Showcase */}
      <div id="custom-furniture">
        <CustomFurnitureShowcase locale={l} />
      </div>

      {/* Materials Section - Compact Comparison Layout */}
      <section id="materials" className="py-12 md:py-16 lg:py-20 relative overflow-hidden">
        {/* Textured Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-lago-charcoal via-lago-dark to-lago-black" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        
        <div className="container-lg relative z-10">
          {/* Section Header - Compact */}
          <AnimatedSection animation="fade-up" className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading text-white mb-3 md:mb-4">
              {l === 'lv' ? 'Izvēlieties savu virsmu' : l === 'en' ? 'Choose Your Surface' : 'Выберите свою поверхность'}
            </h2>
            <p className="text-lago-light text-sm md:text-base max-w-2xl mx-auto">
              {l === 'lv' ? 'Noklikšķiniet uz jebkura materiāla, lai uzzinātu vairāk un apskatītu krāsu opcijas' : l === 'en' ? 'Click on any material to learn more and explore color options' : 'Нажмите на любой материал, чтобы узнать больше и увидеть варианты цветов'}
            </p>
          </AnimatedSection>

          {/* Material Cards - Compact Grid for Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatedSection animation="fade-up" delay={100}>
              <MaterialCardRefactored
                image={images.kitchen1}
                title="Silestone"
                description={l === 'lv' ? 'Kvarca virsmas ar HybriQ+ tehnoloģiju. Augsta izturība pret traipiem.' : l === 'en' ? 'Quartz surfaces with HybriQ+ technology. High stain resistance.' : 'Кварцевые поверхности с технологией HybriQ+.'}
                badge={l === 'lv' ? 'POPULĀRĀKAIS' : l === 'en' ? 'MOST POPULAR' : 'ПОПУЛЯРНЫЙ'}
                badgeStyle="popular"
                rating="★★★★★"
                features={[l === 'lv' ? 'Antibakteriāls' : l === 'en' ? 'Antibacterial' : 'Антибактериальный', l === 'lv' ? '25g garantija' : l === 'en' ? '25yr warranty' : '25 лет']}
                useCases={l === 'lv' ? 'Virtuves • Vannas • Bāri' : l === 'en' ? 'Kitchens • Bathrooms • Bars' : 'Кухни • Ванные • Бары'}
                href={getMaterialUrl(l, 'silestone')}
              />
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <MaterialCardRefactored
                image={images.kitchen2}
                title="Dekton"
                description={l === 'lv' ? 'Ultra-kompaktas virsmas. Maksimāla izturība pret UV, karstumu un skrāpējumiem.' : l === 'en' ? 'Ultra-compact surfaces. Maximum UV, heat and scratch resistance.' : 'Ультракомпактные поверхности. Максимальная устойчивость.'}
                badge={l === 'lv' ? 'ĀRAI + IEKŠTELPĀM' : l === 'en' ? 'INDOOR + OUTDOOR' : 'ДЛЯ УЛИЦЫ'}
                badgeStyle="outdoor"
                rating="★★★★★"
                features={[l === 'lv' ? 'UV izturīgs' : l === 'en' ? 'UV resistant' : 'Устойчив к УФ', l === 'lv' ? 'Karstumizturīgs' : l === 'en' ? 'Heat proof' : 'Термостойкий']}
                useCases={l === 'lv' ? 'Āra virtuves • Fasādes • Grīdas' : l === 'en' ? 'Outdoor • Facades • Flooring' : 'Улица • Фасады • Полы'}
                href={getMaterialUrl(l, 'dekton')}
              />
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <MaterialCardRefactored
                image={images.stone1}
                title={l === 'lv' ? 'Granīts' : l === 'en' ? 'Granite' : 'Гранит'}
                description={l === 'lv' ? 'Dabīgais akmens ar unikālu rakstu. Mūžīga klasika un eleganci.' : l === 'en' ? 'Natural stone with unique patterns. Timeless classic elegance.' : 'Натуральный камень с уникальным рисунком.'}
                badge={l === 'lv' ? 'DABĪGS' : l === 'en' ? 'NATURAL' : 'НАТУРАЛЬНЫЙ'}
                badgeStyle="natural"
                rating="★★★★☆"
                features={[l === 'lv' ? 'Unikāls' : l === 'en' ? 'Unique' : 'Уникальный', l === 'lv' ? 'Ilgmūžīgs' : l === 'en' ? 'Durable' : 'Долговечный']}
                useCases={l === 'lv' ? 'Klasiskās virtuves • Palodzes • Kāpnes' : l === 'en' ? 'Classic kitchens • Sills • Stairs' : 'Классика • Подоконники • Лестницы'}
                href={getMaterialUrl(l, 'granite')}
              />
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={400}>
              <MaterialCardRefactored
                image={images.marble}
                title={l === 'lv' ? 'Marmors' : l === 'en' ? 'Marble' : 'Мрамор'}
                description={l === 'lv' ? 'Elegantais marmors. Luksusa risinājums ar ekskluzivitāti un dabisko skaistumu.' : l === 'en' ? 'Elegant marble. Luxury solution with exclusivity and natural beauty.' : 'Элегантный мрамор. Люксовое решение.'}
                badge={l === 'lv' ? 'PREMIUM' : l === 'en' ? 'PREMIUM' : 'ПРЕМИУМ'}
                badgeStyle="premium"
                rating="★★★★★"
                features={[l === 'lv' ? 'Unikāls' : l === 'en' ? 'Unique' : 'Уникальный', l === 'lv' ? 'Luksuss' : l === 'en' ? 'Luxury' : 'Люкс']}
                useCases={l === 'lv' ? 'Luksusa virtuves • Kamīni • Vannas' : l === 'en' ? 'Luxury kitchens • Fireplaces • Bathrooms' : 'Люкс кухни • Камины • Ванные'}
                href={getMaterialUrl(l, 'marble')}
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Projects Carousel Section */}
      <section className="py-24 bg-lago-black relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-lago-dark via-lago-black to-lago-black" />
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '1.5s' }} />

        <div className="container-lg relative z-10">
          {/* Header */}
          <AnimatedSection animation="fade-up" className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading text-white mb-4">
              {l === 'lv'
                ? 'Mūsu projekti'
                : l === 'en'
                ? 'Our projects'
                : 'Наши проекты'}
            </h2>
            <p className="text-lago-muted max-w-2xl mx-auto text-sm md:text-base">
              {l === 'lv'
                ? 'Apskatiet mūsu pēdējos projektus – no modernām virtuvēm līdz luksusa vannas istabām un individuālām mēbelēm.'
                : l === 'en'
                ? 'View our latest projects – from modern kitchens to luxury bathrooms and bespoke furniture.'
                : 'Посмотрите наши последние проекты – от современных кухонь до люксовых ванных комнат и индивидуальной мебели.'}
            </p>
          </AnimatedSection>

          {/* Projects Carousel */}
          <ProjectsCarousel locale={l} maxProjects={12} />

          {/* View all projects link - Enhanced with animations */}
          <AnimatedSection animation="fade-up" delay={400} className="text-center mt-12">
            <ViewAllProjectsLink href={projectsUrl} locale={l} />
          </AnimatedSection>
        </div>
      </section>

      {/* PERFORMANCE: Simplified transition - removed unnecessary wrapper div */}
      <div className="relative h-12 md:h-16 overflow-hidden bg-gradient-to-b from-lago-black via-lago-black/80 to-lago-charcoal" />

      {/* PERFORMANCE: Optimized CTA Section - reduced nesting */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-lago-charcoal">
        {/* PERFORMANCE: Simplified background pattern - removed unnecessary wrapper */}
        <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        
        {/* Minimal accent elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lago-gold/20 to-transparent" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-lago-gold/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-lago-gold/3 rounded-full blur-3xl opacity-30" />
        
        <div className="container-lg relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Left Column - Text Content */}
              <div className="text-center md:text-left">
                <AnimatedSection animation="fade-up" delay={100}>
                  {/* Main Headline */}
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-4 leading-tight">
                    {l === 'lv' 
                      ? 'Sāksim jūsu'
                      : l === 'en'
                      ? 'Let\'s start your'
                      : 'Начнем ваш'}{' '}
                    <span className="text-lago-gold">
                      {l === 'lv' 
                        ? 'projektu'
                        : l === 'en'
                        ? 'project'
                        : 'проект'}
                    </span>
                  </h2>
                  
                  {/* Subheading */}
                  <p className="text-lg md:text-xl text-lago-light/80 mb-6 leading-relaxed max-w-xl mx-auto md:mx-0">
                    {l === 'lv'
                      ? 'Bezmaksas konsultācija un profesionāla pieeja jūsu sapņu virtuvei vai interjeram. Mēs palīdzam jums izveidot ideālo risinājumu.'
                      : l === 'en'
                      ? 'Free consultation and professional approach for your dream kitchen or interior. We help you create the perfect solution.'
                      : 'Бесплатная консультация и профессиональный подход для кухни или интерьера вашей мечты. Мы поможем вам создать идеальное решение.'}
                  </p>
                  
                  {/* Logo - Mobile: below subtitle (hidden on desktop) */}
                  <div className="mb-6 md:hidden">
                    <div className="flex justify-center">
                      <LogoWithGlow 
                        width={280} 
                        height={112} 
                        className="relative h-auto w-48"
                        padding="sm"
                        priority
                      />
                    </div>
                  </div>
                  
                  {/* Trust Stats */}
                  <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                    <div className="text-center md:text-left">
                      <div className="text-2xl md:text-3xl font-heading text-white mb-1">1000+</div>
                      <div className="text-sm text-lago-light/70">
                        {l === 'lv' ? 'Projekti' : l === 'en' ? 'Projects' : 'Проектов'}
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl md:text-3xl font-heading text-white mb-1">20+</div>
                      <div className="text-sm text-lago-light/70">
                        {l === 'lv' ? 'Gadi pieredzes' : l === 'en' ? 'Years experience' : 'Лет опыта'}
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl md:text-3xl font-heading text-white mb-1">2003</div>
                      <div className="text-sm text-lago-light/70">
                        {l === 'lv' ? 'Gads, kad dibināts' : l === 'en' ? 'Year founded' : 'Год основания'}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
              
              {/* Right Column - CTA & Visuals */}
              <div className="relative">
                <AnimatedSection animation="fade-up" delay={200}>
                  {/* Logo - Desktop: above button */}
                  <div className="hidden md:flex justify-center mb-8">
                    <LogoWithGlow priority={false} />
                  </div>
                  
                  {/* Single CTA Button */}
                  <CTALink
                    href={`/${l}/${l === 'lv' ? 'par-mums#contact' : l === 'ru' ? 'o-nas#contact' : 'about-us#contact'}`}
                    locale={l}
                  />
                  
                  {/* Subtle decorative elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-lago-gold/5 rounded-full blur-2xl -z-10" />
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-lago-charcoal/5 rounded-full blur-2xl -z-10" />
                </AnimatedSection>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
