'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { projects } from '@/content/projects'
import type { Material } from '@/content/types'

// Fallback images that actually exist
const fallbackImages = [
  '/images/materials/silestone/silestone-seaport.jpg',
  '/images/materials/dekton/dekton-nolita.jpg',
  '/images/materials/marble/marble-emperador.jpg',
  '/images/materials/granite/granite-charcoal.jpg',
  '/images/furniture/interior/interior-sink.jpg',
  '/images/furniture/kitchens/kitchen-1.jpg',
  '/images/furniture/kitchens/kitchen-2.jpg',
  '/images/furniture/interior/bathroom-faro.jpg',
]

interface MaterialProjectsSectionProps {
  locale: Locale
  material: Material
}

export function MaterialProjectsSection({ locale, material }: MaterialProjectsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 6
  
  const materialProjects = useMemo(() => {
    return projects.filter(p => p.material === material.id)
  }, [material.id])
  
  if (materialProjects.length === 0) return null
  
  // Pagination
  const totalPages = Math.ceil(materialProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const paginatedProjects = materialProjects.slice(startIndex, startIndex + projectsPerPage)
  
  const projectsBase = locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'
  
  // Get project image with fallback
  const getProjectImage = (project: typeof projects[0], index: number) => {
    if (project.heroImage && project.heroImage.startsWith('/images/')) {
      return project.heroImage
    }
    return fallbackImages[index % fallbackImages.length]
  }
  
  return (
    <section className="py-24 bg-lago-dark relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
      
      <div className="container-lg relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <span className="inline-block px-4 py-2 bg-lago-gold/10 text-lago-gold text-sm font-medium uppercase tracking-widest rounded-full mb-6">
            {locale === 'lv' ? 'Realizētie projekti' : locale === 'en' ? 'Completed Projects' : 'Реализованные проекты'}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6">
            {locale === 'lv' 
              ? `Projekti ar ${material.name[locale]}`
              : locale === 'en'
              ? `Projects with ${material.name[locale]}`
              : `Проекты с ${material.name[locale]}`}
          </h2>
          <p className="text-lago-light text-lg max-w-2xl mx-auto">
            {locale === 'lv' 
              ? 'Apskatiet mūsu realizētos projektus, kuros izmantots šis materiāls.'
              : locale === 'en'
              ? 'View our completed projects featuring this material.'
              : 'Посмотрите наши реализованные проекты с этим материалом.'}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedProjects.map((project, index) => {
            const projectImage = getProjectImage(project, startIndex + index)
            
            return (
              <Link
                key={project.id}
                href={`/${locale}/${projectsBase}/${project.slug[locale]}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-lago-charcoal/50 backdrop-blur-sm border border-white/5 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/10 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: 'forwards' }}
              >
                {/* Project Image */}
                <div className="relative h-full overflow-hidden">
                  <Image
                    src={projectImage}
                    alt={project.title[locale]}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-lago-black via-lago-black/50 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-lago-gold/90 backdrop-blur text-lago-black text-xs font-bold rounded-full">
                      {project.category === 'stone' 
                        ? (locale === 'lv' ? 'Akmens' : locale === 'en' ? 'Stone' : 'Камень')
                        : (locale === 'lv' ? 'Mēbeles' : locale === 'en' ? 'Furniture' : 'Мебель')}
                    </span>
                  </div>
                  
                  {/* Year Badge */}
                  {project.year && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 bg-white/20 backdrop-blur text-white text-xs font-medium rounded-full border border-white/30">
                        {project.year}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Project Info Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="transform transition-all duration-300 group-hover:translate-y-[-8px]">
                    <h3 className="text-xl md:text-2xl font-heading text-white mb-2 group-hover:text-lago-gold transition-colors duration-300">
                      {project.title[locale]}
                    </h3>
                    {project.location && (
                      <p className="text-lago-light/70 text-sm flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4" />
                        {project.location[locale]}
                      </p>
                    )}
                    <p className="text-lago-light/80 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {project.summary[locale]}
                    </p>
                  </div>
                  
                  {/* View Project Link */}
                  <div className="mt-4 flex items-center gap-2 text-lago-gold text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <span>{locale === 'lv' ? 'Apskatīt projektu' : locale === 'en' ? 'View Project' : 'Посмотреть проект'}</span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-lago-gold/10 via-transparent to-transparent" />
                </div>
                
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lago-gold/0 group-hover:border-lago-gold/50 transition-colors duration-300 rounded-tl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lago-gold/0 group-hover:border-lago-gold/50 transition-colors duration-300 rounded-br-xl" />
              </Link>
            )
          })}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-lago-charcoal/50 text-lago-light hover:bg-lago-charcoal hover:text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {locale === 'lv' ? 'Iepriekšējā' : locale === 'en' ? 'Previous' : 'Предыдущая'}
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-lago-gold text-lago-black shadow-lg shadow-lago-gold/30'
                          : 'bg-lago-charcoal/50 text-lago-light hover:bg-lago-charcoal hover:text-white border border-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-lago-muted">...</span>
                }
                return null
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-lago-charcoal/50 text-lago-light hover:bg-lago-charcoal hover:text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
            >
              {locale === 'lv' ? 'Nākamā' : locale === 'en' ? 'Next' : 'Следующая'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Results count */}
        <div className="mt-8 text-center text-lago-muted text-sm">
          {locale === 'lv' 
            ? `Rāda ${startIndex + 1}-${Math.min(startIndex + projectsPerPage, materialProjects.length)} no ${materialProjects.length} projektiem`
            : locale === 'en'
            ? `Showing ${startIndex + 1}-${Math.min(startIndex + projectsPerPage, materialProjects.length)} of ${materialProjects.length} projects`
            : `Показано ${startIndex + 1}-${Math.min(startIndex + projectsPerPage, materialProjects.length)} из ${materialProjects.length} проектов`}
        </div>
        
        {/* View All Projects Link */}
        <div className="text-center mt-12 opacity-0 animate-fade-in-up" style={{ animationDelay: `${300 + paginatedProjects.length * 100}ms`, animationFillMode: 'forwards' }}>
          <Link
            href={`/${locale}/${projectsBase}`}
            className="inline-flex items-center gap-2 text-lago-gold hover:text-lago-gold-light transition-colors duration-300 group"
          >
            <span className="text-lg font-medium">
              {locale === 'lv' ? 'Apskatīt visus projektus' : locale === 'en' ? 'View All Projects' : 'Посмотреть все проекты'}
            </span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

