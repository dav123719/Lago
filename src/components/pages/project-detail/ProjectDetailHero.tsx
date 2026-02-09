'use client'

import Image from 'next/image'
import { Locale } from '@/lib/i18n/config'
import { Project } from '@/content/types'
import { HeroImageCarousel } from '@/components/ui/HeroImageCarousel'

interface ProjectDetailHeroProps {
  project: Project
  locale: Locale
}

export function ProjectDetailHero({ project, locale }: ProjectDetailHeroProps) {
  // Determine hero images - use gallery if available, otherwise use heroImage
  const heroImages = project.gallery && project.gallery.length > 0
    ? project.gallery.slice(0, 3).map(img => img.src)
    : project.heroImage
      ? [project.heroImage]
      : []

  // Get project type tag
  const projectTypeTag = project.installationLocation[0] || project.tags[0]
  const typeLabels: Record<string, Record<Locale, string>> = {
    kitchen: { lv: 'Virtuve', en: 'Kitchen', ru: 'Кухня' },
    bathroom: { lv: 'Vannas istaba', en: 'Bathroom', ru: 'Ванная' },
    commercial: { lv: 'Komerciāls', en: 'Commercial', ru: 'Коммерческий' },
    residential: { lv: 'Dzīvojamais', en: 'Residential', ru: 'Жилой' },
    outdoor: { lv: 'Āra zona', en: 'Outdoor', ru: 'Уличная зона' },
    interior: { lv: 'Interjers', en: 'Interior', ru: 'Интерьер' },
    furniture: { lv: 'Mēbeles', en: 'Furniture', ru: 'Мебель' },
  }

  return (
    <section className="relative min-h-[70vh] flex items-end overflow-hidden">
      {/* Hero Image/Carousel */}
      <div className="absolute inset-0">
        {heroImages.length > 1 ? (
          <HeroImageCarousel images={heroImages} />
        ) : heroImages.length === 1 ? (
          <Image
            src={heroImages[0]}
            alt={project.title[locale]}
            fill
            priority
            sizes="100vw"
            quality={80}
            className="object-cover scale-105 animate-slowZoom"
            style={{ animationDuration: '20s' }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-lago-black via-lago-black/60 to-lago-black/20" />
      </div>

      {/* Content */}
      <div className="relative container-lg pb-20 pt-40 z-10">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
          {project.title[locale]}
        </h1>

        {/* Subtitle */}
        {project.subtitle && (
          <p className="text-lago-light/90 text-xl md:text-2xl max-w-3xl mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            {project.subtitle[locale]}
          </p>
        )}

        {/* Tags - Only show installation location */}
        <div className="flex flex-wrap gap-3 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          {projectTypeTag && typeLabels[projectTypeTag] && (
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/20">
              {typeLabels[projectTypeTag][locale]}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

