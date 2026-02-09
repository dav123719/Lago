'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin, Calendar, Box, ArrowRight } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { projects } from '@/content/projects'
import type { MaterialType } from '@/content/types'

// Fallback images
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

// Get project image with fallback
function getProjectImage(project: typeof projects[0], index: number): string {
  if (project.heroImage && project.heroImage.startsWith('/images/')) {
    return project.heroImage
  }
  return fallbackImages[index % fallbackImages.length]
}

// Get material display name
function getMaterialName(material: MaterialType, locale: Locale): string {
  const names: Record<MaterialType, Record<Locale, string>> = {
    silestone: { lv: 'Silestone', en: 'Silestone', ru: 'Silestone' },
    dekton: { lv: 'Dekton', en: 'Dekton', ru: 'Dekton' },
    granite: { lv: 'Granīts', en: 'Granite', ru: 'Гранит' },
    marble: { lv: 'Marmors', en: 'Marble', ru: 'Мрамор' },
  }
  return names[material][locale]
}

interface ProjectsCarouselProps {
  locale: Locale
  maxProjects?: number
}

export function ProjectsCarousel({ locale, maxProjects = 12 }: ProjectsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [itemsPerView, setItemsPerView] = useState(3)
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get the most recent projects (first 12)
  const displayProjects = projects.slice(0, maxProjects)

  // Intersection Observer to detect when carousel is visible
  useEffect(() => {
    if (!carouselRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      {
        root: null,
        rootMargin: '100px', // Start animation slightly before fully visible
        threshold: 0.1, // Trigger when 10% is visible
      }
    )

    observer.observe(carouselRef.current)

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current)
      }
    }
  }, [])

  // Calculate items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (typeof window === 'undefined') return
      const width = window.innerWidth
      if (width < 640) {
        setItemsPerView(1) // Mobile: 1 item
      } else if (width < 1024) {
        setItemsPerView(2) // Tablet: 2 items
      } else {
        setItemsPerView(3) // Desktop: 3 items
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  // Calculate total slides needed
  const totalSlides = Math.ceil(displayProjects.length / itemsPerView)

  // Auto-scroll functionality - only when visible and not paused
  useEffect(() => {
    if (isPaused || !isVisible || displayProjects.length === 0) {
      // Clear interval if paused, not visible, or no projects
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
      return
    }

    // Start auto-scroll when visible
    autoScrollIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, 7000) // Change slide every 7 seconds (slower rotation)

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
    }
  }, [isPaused, isVisible, totalSlides, displayProjects.length])

  // Navigate to specific slide
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsPaused(true)
    // Resume auto-scroll after 8 seconds
    setTimeout(() => setIsPaused(false), 8000)
  }, [])

  // Navigate to next slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 8000)
  }, [totalSlides])

  // Navigate to previous slide
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 8000)
  }, [totalSlides])

  // Get projects for current slide
  const getCurrentSlideProjects = () => {
    const start = currentIndex * itemsPerView
    const end = start + itemsPerView
    return displayProjects.slice(start, end)
  }

  const projectsBaseUrl = `/${locale}/${locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'}`

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="relative overflow-hidden rounded-xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Projects Grid */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const start = slideIndex * itemsPerView
            const slideProjects = displayProjects.slice(start, start + itemsPerView)

            return (
              <div
                key={slideIndex}
                className="min-w-full flex-shrink-0 grid gap-6 lg:gap-8"
                style={{
                  gridTemplateColumns: `repeat(${itemsPerView}, 1fr)`,
                }}
              >
                {slideProjects.map((project, projectIndex) => {
                  const globalIndex = start + projectIndex
                  const projectImage = getProjectImage(project, globalIndex)

                  return (
                    <Link
                      key={project.id}
                      href={`${projectsBaseUrl}/${project.slug[locale]}`}
                      className="group relative h-[400px] md:h-[500px] rounded-xl overflow-hidden bg-lago-charcoal/50 border border-white/5 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/20 hover:-translate-y-2"
                    >
                      {/* Project Image */}
                      <div className="absolute inset-0 img-zoom">
                        <Image
                          src={projectImage}
                          alt={project.title[locale]}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          // PERFORMANCE: Responsive sizes ensure mobile doesn't download desktop images
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          // PERFORMANCE: Projects carousel is below fold - lazy load all images
                          loading="lazy"
                          quality={75} // PERFORMANCE: Reduced quality to save bandwidth
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-lago-dark via-lago-dark/60 to-transparent" />
                      
                      {/* Project Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        {/* Category Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          {project.category === 'stone' ? (
                            <MapPin className="w-5 h-5 text-lago-gold" />
                          ) : (
                            <Box className="w-5 h-5 text-lago-gold" />
                          )}
                          <span className="text-lago-gold text-sm font-medium uppercase tracking-wider">
                            {project.category === 'stone'
                              ? locale === 'lv'
                                ? 'Akmens'
                                : locale === 'en'
                                  ? 'Stone'
                                  : 'Камень'
                              : locale === 'lv'
                                ? 'Mēbeles'
                                : locale === 'en'
                                  ? 'Furniture'
                                  : 'Мебель'}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-heading text-white mb-2 group-hover:text-lago-gold transition-colors">
                          {project.title[locale]}
                        </h3>
                        
                        {/* Summary */}
                        <p className="text-lago-light/80 text-sm mb-3">
                          {project.summary[locale]}
                        </p>
                        
                        {/* Material Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.material && (
                            <span className="px-2.5 py-1 bg-lago-gold/20 text-lago-gold text-xs rounded-md">
                              {getMaterialName(project.material, locale)}
                            </span>
                          )}
                          {project.year && (
                            <span className="px-2.5 py-1 bg-lago-gold/20 text-lago-gold text-xs rounded-md">
                              {project.year}
                            </span>
                          )}
                        </div>
                        
                        {/* View Project Link */}
                        <div className="flex items-center gap-2 text-lago-gold text-sm font-medium">
                          <span>{locale === 'lv' ? 'Apskatīt projektu' : locale === 'en' ? 'View project' : 'Посмотреть проект'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>

                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Minimal Side Navigation Buttons - Subtle overlay, more prominent on hover */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left Button - Minimal overlay */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-lago-black/40 backdrop-blur-sm border border-white/10 hover:border-lago-gold/60 text-white/70 hover:text-lago-gold transition-all duration-300 flex items-center justify-center hover:scale-110 hover:bg-lago-black/80 hover:shadow-lg hover:shadow-lago-gold/30 group pointer-events-auto hover:opacity-100 opacity-60"
          aria-label="Previous projects"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-x-0.5 transition-transform duration-300" />
        </button>

        {/* Right Button - Minimal overlay */}
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-lago-black/40 backdrop-blur-sm border border-white/10 hover:border-lago-gold/60 text-white/70 hover:text-lago-gold transition-all duration-300 flex items-center justify-center hover:scale-110 hover:bg-lago-black/80 hover:shadow-lg hover:shadow-lago-gold/30 group pointer-events-auto hover:opacity-100 opacity-60"
          aria-label="Next projects"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-0.5 transition-transform duration-300" />
        </button>
      </div>

      {/* Dots Navigation */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentIndex
                  ? 'w-8 bg-lago-gold shadow-lg shadow-lago-gold/30'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

