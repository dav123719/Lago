'use client'

import { useEffect, useRef, useState } from 'react'
import { Locale } from '@/lib/i18n/config'
import { AnimatedSection } from './AnimatedSection'
import { ImageCarousel } from './ImageCarousel'

interface FeatureRow {
  images: string[]
  label: string
  description: string
  imagePosition: 'left' | 'right'
}

interface CustomFurnitureShowcaseProps {
  locale: Locale
}

export function CustomFurnitureShowcase({ locale }: CustomFurnitureShowcaseProps) {
  const [isVisible, setIsVisible] = useState<boolean[]>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    const observerOptions = {
      root: null,
      rootMargin: prefersReducedMotion ? '0px' : '150px 0px 0px 0px',
      threshold: 0.05,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = rowRefs.current.indexOf(entry.target as HTMLDivElement)
        if (index !== -1) {
          setIsVisible((prev) => {
            const newState = [...prev]
            newState[index] = entry.isIntersecting
            return newState
          })
        }
      })
    }, observerOptions)

    const currentRefs = rowRefs.current
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [prefersReducedMotion])

  const l = locale

  const features: FeatureRow[] = [
    {
      images: [
        '/images/furniture/Kitchen1.webp',
        '/images/furniture/Kitchen2.webp',
        '/images/furniture/Kitchen3.webp',
        '/images/furniture/Kitchen4.webp',
        '/images/furniture/Kitchen5.webp',
      ],
      label: l === 'lv' ? 'Virtuves ar akmens virsmām' : l === 'en' ? 'Kitchens with stone surfaces' : 'Кухни с каменными поверхностями',
      description: l === 'lv' 
        ? 'Individuāli projektētas virtuves ar premium akmens virsmām – Silestone, Dekton, granīts un marmors.'
        : l === 'en'
        ? 'Custom-designed kitchens with premium stone surfaces – Silestone, Dekton, granite and marble.'
        : 'Индивидуально спроектированные кухни с премиальными каменными поверхностями – Silestone, Dekton, гранит и мрамор.',
      imagePosition: 'left',
    },
    {
      images: [
        '/images/furniture/bathroom1.webp',
        '/images/furniture/bathroom2.webp',
        '/images/furniture/Bathroom3.webp',
        '/images/furniture/Bathroom4.webp',
        '/images/furniture/Bathroom5.webp',
      ],
      label: l === 'lv' ? 'Vannas istabas ar akmens virsmām' : l === 'en' ? 'Bathrooms with stone surfaces' : 'Ванные комнаты с каменными поверхностями',
      description: l === 'lv'
        ? 'Luksusa vannas istabas ar akmens virsmām, izlietnēm un pilnīgi individuāliem risinājumiem.'
        : l === 'en'
        ? 'Luxury bathrooms with stone surfaces, sinks and fully custom solutions.'
        : 'Роскошные ванные комнаты с каменными поверхностями, раковинами и полностью индивидуальными решениями.',
      imagePosition: 'right',
    },
    {
      images: [
        '/images/furniture/Sink1.webp',
        '/images/furniture/Sink2.webp',
        '/images/furniture/Sink3.webp',
        '/images/furniture/Sink4.webp',
        '/images/furniture/Sink5.webp',
      ],
      label: l === 'lv' ? 'Akmens izlietnes' : l === 'en' ? 'Stone sinks' : 'Каменные раковины',
      description: l === 'lv'
        ? 'Individuāli projektētas akmens izlietnes virtuvei un vannas istabai – integrētas izlietnes, pielāgoti izmēri un formas no premium materiāliem.'
        : l === 'en'
        ? 'Custom-designed stone sinks for kitchens and bathrooms – integrated sinks, custom sizes and shapes from premium materials.'
        : 'Индивидуально спроектированные каменные раковины для кухни и ванной – интегрированные раковины, индивидуальные размеры и формы из премиальных материалов.',
      imagePosition: 'left',
    },
    {
      images: [
        '/images/furniture/Elements1.webp',
        '/images/furniture/Elements2.webp',
        '/images/furniture/Elements3.webp',
        '/images/furniture/Elements4.webp',
        '/images/furniture/Elements5.webp',
      ],
      label: l === 'lv' ? 'Interjera akmens elementi' : l === 'en' ? 'Interior stone elements' : 'Интерьерные каменные элементы',
      description: l === 'lv'
        ? 'Galdi, palodzes, kamīni, kāpnes un citi interjera elementi no premium akmens materiāliem.'
        : l === 'en'
        ? 'Tables, window sills, fireplaces, stairs and other interior elements from premium stone materials.'
        : 'Столы, подоконники, камины, лестницы и другие интерьерные элементы из премиальных каменных материалов.',
      imagePosition: 'right',
    },
    {
      images: [
        '/images/furniture/Outdoor1.webp',
        '/images/furniture/Outdoor2.webp',
        '/images/furniture/Outdoor3.webp',
        '/images/furniture/Outdoor4.webp',
        '/images/furniture/Outdoor5.webp',
      ],
      label: l === 'lv' ? 'Fasādes un āra zonas' : l === 'en' ? 'Facades and outdoor areas' : 'Фасады и уличные зоны',
      description: l === 'lv'
        ? 'Mūsdienīgas fasādes, āra terases, celiņi un āra virtuves ar Dekton un citiem ilgtspējīgiem akmens materiāliem. Izturīgi un estētiski risinājumi āra telpām.'
        : l === 'en'
        ? 'Modern facades, outdoor terraces, pathways and outdoor kitchens with Dekton and other durable stone materials. Durable and aesthetic solutions for outdoor spaces.'
        : 'Современные фасады, уличные террасы, дорожки и уличные кухни с Dekton и другими долговечными каменными материалами. Прочные и эстетичные решения для уличных пространств.',
      imagePosition: 'left',
    },
    {
      images: [
        '/images/furniture/Furniture1.webp',
        '/images/furniture/Furniture2.webp',
        '/images/furniture/Furniture3.webp',
        '/images/furniture/Furniture4.webp',
        '/images/furniture/Furniture5.webp',
      ],
      label: l === 'lv' ? 'Individuālas mēbeles' : l === 'en' ? 'Custom furniture' : 'Индивидуальная мебель',
      description: l === 'lv'
        ? 'Mēbeles ar vai bez akmens, ar LED apgaismojumu un dažādiem atvēršanas veidiem – push-to-open, slīdošās, lift-up durvis.'
        : l === 'en'
        ? 'Furniture with or without stone, with LED lighting and various opening systems – push-to-open, sliding, lift-up doors.'
        : 'Мебель с камнем или без, с LED-освещением и различными системами открывания – push-to-open, раздвижные, подъемные двери.',
      imagePosition: 'right',
    },
  ]

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lago-charcoal via-lago-dark to-lago-black" />
      
      {/* Subtle radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,169,98,0.03)_0%,transparent_50%)]" />
      
      {/* Enhanced grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.01)_50%,transparent_100%)]" />
      
      {/* Enhanced animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lago-gold/8 rounded-full blur-3xl animate-breathe" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lago-gold/8 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
      
      {/* Additional subtle accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lago-gold/3 rounded-full blur-3xl opacity-50" />

      <div className="container-lg relative z-10">
        {/* Header Section */}
        <AnimatedSection animation="fade-up" className="mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading text-white mb-6">
              {l === 'lv' 
                ? 'Individuāli projektētas mēbeles & akmens risinājumi'
                : l === 'en'
                ? 'Custom designed furniture & stone solutions'
                : 'Индивидуально спроектированная мебель и каменные решения'}
            </h2>
            <p className="text-lago-muted text-lg md:text-xl leading-relaxed">
              {l === 'lv'
                ? 'Mēs projektējam un izgatavojam individuālas akmens virsmas un mēbeles, kas pilnībā atbilst jūsu vajadzībām un stilam.'
                : l === 'en'
                ? 'We design and manufacture custom stone surfaces and furniture that fully meet your needs and style.'
                : 'Мы проектируем и изготавливаем индивидуальные каменные поверхности и мебель, которые полностью соответствуют вашим потребностям и стилю.'}
            </p>
          </div>
        </AnimatedSection>

        {/* Feature Rows */}
        <div className="space-y-12 md:space-y-16">
          {features.map((feature, index) => {
            const isLeft = feature.imagePosition === 'left'
            const isRowVisible = isVisible[index] ?? false

            return (
              <div
                key={index}
                ref={(el) => {
                  rowRefs.current[index] = el
                }}
                className="group/row relative"
              >
                {/* Premium Border Container - Card appears first */}
                <div className={`relative rounded-2xl md:rounded-3xl overflow-hidden ${
                  prefersReducedMotion || isRowVisible 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-[0.98]'
                } ${prefersReducedMotion ? '' : 'transition-all duration-600 ease-out'}`}
                style={
                  prefersReducedMotion
                    ? {}
                    : {
                        transitionDelay: `${index * 150}ms`,
                      }
                }>
                  {/* Outer border with glow */}
                  <div className="absolute -inset-[1px] rounded-2xl md:rounded-3xl bg-gradient-to-br from-lago-gold/20 via-lago-gold/10 to-lago-gold/20 opacity-0 group-hover/row:opacity-100 transition-opacity duration-700 blur-sm" />
                  
                  {/* Main border */}
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-lago-gold/10 group-hover/row:border-lago-gold/30 transition-all duration-700 pointer-events-none" />
                  
                  {/* Inner glow on hover */}
                  <div className="absolute inset-[1px] rounded-2xl md:rounded-3xl bg-lago-gold/0 group-hover/row:bg-lago-gold/5 transition-all duration-700 pointer-events-none" />
                  
                  {/* Background with subtle gradient */}
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-lago-charcoal/20 via-transparent to-lago-charcoal/20 opacity-0 group-hover/row:opacity-100 transition-opacity duration-700" />

                  {/* Content Container */}
                  <div className={`relative flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12 lg:gap-16 p-6 md:p-8 lg:p-10`}>
                {/* Image Carousel - Animates in after card */}
                <div
                  className={`order-2 md:order-none relative w-full md:w-[65%] h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl group ${
                    isLeft ? 'md:-mr-8 lg:-mr-12' : 'md:-ml-8 lg:-ml-12'
                  } ${
                    prefersReducedMotion || isRowVisible 
                      ? 'opacity-100 translate-x-0' 
                      : isLeft 
                        ? 'opacity-0 -translate-x-8' 
                        : 'opacity-0 translate-x-8'
                  } ${prefersReducedMotion ? '' : 'transition-all duration-700 ease-out'}`}
                  style={
                    prefersReducedMotion
                      ? {}
                      : {
                          transitionDelay: `${(index * 150) + 300}ms`,
                        }
                  }
                >
                  {/* Subtle inner border for depth */}
                  <div className="absolute inset-0 rounded-xl border border-white/5 group-hover/row:border-white/10 transition-all duration-500 z-10 pointer-events-none" />
                  
                  {/* Carousel */}
                  <ImageCarousel
                    images={feature.images}
                    alt={feature.label}
                    className="w-full h-full"
                    autoRotateInterval={5000}
                    prefersReducedMotion={prefersReducedMotion}
                    isVisible={isRowVisible}
                  />
                  
                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-lago-black/80 via-lago-black/30 to-transparent group-hover/row:from-lago-black/70 group-hover/row:via-lago-black/20 transition-all duration-500 pointer-events-none z-10" />
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover/row:opacity-100 transition-opacity duration-700 pointer-events-none z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/row:translate-x-full transition-transform duration-1000 ease-out" />
                  </div>
                </div>

                {/* Text Content - Animates in after card */}
                <div
                  className={`order-1 md:order-none w-full md:w-[35%] flex flex-col justify-center ${
                    isLeft ? 'md:items-start md:text-left md:pl-8 lg:pl-12' : 'md:items-end md:text-right md:pr-8 lg:pr-12'
                  } items-center text-center ${
                    prefersReducedMotion || isRowVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  } ${prefersReducedMotion ? '' : 'transition-all duration-700 ease-out'}`}
                  style={
                    prefersReducedMotion
                      ? {}
                      : {
                          transitionDelay: `${(index * 150) + 400}ms`,
                        }
                  }
                >
                  <div className="max-w-md relative">
                    {/* Title with enhanced typography */}
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading text-white mb-5 group-hover/row:text-lago-gold/90 transition-colors duration-500 leading-tight">
                      {feature.label}
                    </h3>
                    
                    {/* Description with refined spacing */}
                    <p className="text-lago-light/80 text-base md:text-lg leading-relaxed group-hover/row:text-lago-light/90 transition-colors duration-500">
                      {feature.description}
                    </p>
                    
                    {/* Decorative accent line */}
                    <div className={`mt-6 h-[1px] w-16 bg-gradient-to-r ${isLeft ? 'from-lago-gold/50 to-transparent' : 'from-transparent to-lago-gold/50 ml-auto'} opacity-0 group-hover/row:opacity-100 transition-opacity duration-500`} />
                  </div>
                </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}









