'use client'

import { useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  ArrowUpRight, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  ChefHat,
  Droplet,
  Home,
  TreePine,
  Sofa,
  Building2,
  Filter
} from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { translations } from '@/lib/i18n/translations'
import { projects } from '@/content/projects'
import type { MaterialType, InstallationLocation } from '@/content/types'

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

// Filter Button Component with hover animations
function FilterButton({ 
  children, 
  onClick, 
  isSelected, 
  className = '', 
  style = {} 
}: { 
  children: React.ReactNode
  onClick: () => void
  isSelected: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={(e) => {
        setIsHovered(true)
        handleMouseMove(e)
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        className,
        'group/btn relative rounded-xl font-medium text-base transition-all duration-300 transform hover:scale-105 overflow-hidden',
        isSelected
          ? 'bg-lago-gold text-lago-black shadow-lg shadow-lago-gold/30 scale-105 border-0 ring-2 ring-lago-gold/40'
          : 'bg-lago-charcoal/50 text-lago-light hover:bg-lago-charcoal hover:text-white border border-white/10 hover:border-lago-gold/30 hover:ring-1 hover:ring-lago-gold/20'
      ].filter(Boolean).join(' ')}
      style={style}
    >
      {/* Glassmorphism hover effect */}
      <div className={`absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-250 ${
        isSelected || isHovered
          ? 'opacity-100 -translate-y-0.5 scale-[1.02] shadow-lg shadow-black/20'
          : 'opacity-0'
      }`} />
      
      {/* Dynamic gloss/shine effect that follows mouse */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-250 pointer-events-none ${
          isSelected || isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`,
          transition: isHovered ? 'background 0.1s ease-out, transform 0.1s ease-out' : 'opacity 0.25s ease-out',
          willChange: 'background, transform',
        }}
      />
      
      {/* Subtle glow effect that follows mouse */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-250 pointer-events-none blur-xl ${
          isSelected || isHovered ? 'opacity-60' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, rgba(201, 169, 98, 0.3) 0%, transparent 60%)`,
          transform: `translate(${(mousePosition.x - 50) * 0.15}px, ${(mousePosition.y - 50) * 0.15}px)`,
          transition: isHovered ? 'background 0.15s ease-out, transform 0.15s ease-out' : 'opacity 0.25s ease-out',
          willChange: 'background, transform',
        }}
      />
      
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export function ProjectsPage({ locale }: { locale: Locale }) {
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialType[]>([])
  const [selectedLocations, setSelectedLocations] = useState<InstallationLocation[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 6
  
  const content = {
    title: { lv: 'Projekti', en: 'Projects', ru: 'Проекты' },
    subtitle: {
      lv: 'Apskatiet mūsu realizētos projektus - no privātām virtuvēm līdz komerciālajiem objektiem.',
      en: 'View our completed projects - from private kitchens to commercial spaces.',
      ru: 'Посмотрите наши реализованные проекты.',
    },
    filterDescription: {
      lv: 'Izpētiet mūsu projektus pēc materiāla vai uzstādīšanas vietas. Izmantojiet filtrus, lai atrastu piemērus, kas ir svarīgi jums.',
      en: 'Browse our projects by material or installation location. Use the filters to find examples relevant to you.',
      ru: 'Просмотрите наши проекты по материалу или месту установки. Используйте фильтры, чтобы найти примеры, релевантные для вас.',
    },
    materialFilterLabel: {
      lv: 'Filtrēt pēc materiāla',
      en: 'Filter by material',
      ru: 'Фильтр по материалу',
    },
    locationFilterLabel: {
      lv: 'Filtrēt pēc uzstādīšanas vietas',
      en: 'Filter by installation location',
      ru: 'Фильтр по месту установки',
    },
    noResults: {
      lv: 'Nav atrasti projekti ar izvēlētajiem filtriem.',
      en: 'No projects found with the selected filters.',
      ru: 'Проекты с выбранными фильтрами не найдены.',
    },
  }
  
  // Installation location options with icons and descriptions
  const installationLocations: Array<{
    value: InstallationLocation
    icon: typeof ChefHat
    label: Record<Locale, string>
    description: Record<Locale, string>
  }> = [
    {
      value: 'kitchen',
      icon: ChefHat,
      label: { lv: 'Virtuve', en: 'Kitchen', ru: 'Кухня' },
      description: { lv: 'Virtuves virsmas un mēbeles', en: 'Kitchen surfaces and furniture', ru: 'Кухонные поверхности и мебель' },
    },
    {
      value: 'bathroom',
      icon: Droplet,
      label: { lv: 'Vannas istaba', en: 'Bathroom', ru: 'Ванная' },
      description: { lv: 'Vannas istabu apdare un izlietnes', en: 'Bathroom finishes and sinks', ru: 'Отделка ванных комнат и раковины' },
    },
    {
      value: 'interior',
      icon: Home,
      label: { lv: 'Interjers', en: 'Interior', ru: 'Интерьер' },
      description: { lv: 'Kamīni, kāpnes, palodzes un citi elementi', en: 'Fireplaces, stairs, sills and other elements', ru: 'Камины, лестницы, подоконники и другие элементы' },
    },
    {
      value: 'outdoor',
      icon: TreePine,
      label: { lv: 'Āra zona', en: 'Outdoor', ru: 'Уличная зона' },
      description: { lv: 'Fasādes, terases un āra virtuves', en: 'Facades, terraces and outdoor kitchens', ru: 'Фасады, террасы и уличные кухни' },
    },
    {
      value: 'furniture',
      icon: Sofa,
      label: { lv: 'Mēbeles', en: 'Furniture', ru: 'Мебель' },
      description: { lv: 'Individuāli projektētas mēbeles', en: 'Custom-designed furniture', ru: 'Индивидуально спроектированная мебель' },
    },
    {
      value: 'commercial',
      icon: Building2,
      label: { lv: 'Komerciāls', en: 'Commercial', ru: 'Коммерческий' },
      description: { lv: 'Biroji, viesnīcas un citi komerciālie objekti', en: 'Offices, hotels and other commercial spaces', ru: 'Офисы, отели и другие коммерческие объекты' },
    },
  ]
  
  // Toggle material filter (multi-select)
  const toggleMaterial = (material: MaterialType) => {
    setSelectedMaterials(prev => 
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    )
    setCurrentPage(1) // Reset to page 1 when filter changes
  }
  
  // Toggle location filter
  const toggleLocation = (location: InstallationLocation) => {
    setSelectedLocations(prev => 
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    )
    setCurrentPage(1) // Reset to page 1 when filter changes
  }
  
  // Filter projects based on selected materials and locations
  const filteredProjects = useMemo(() => {
    let filtered = projects
    
    // Filter by material (multi-select)
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(project => project.material && selectedMaterials.includes(project.material))
    }
    
    // Filter by installation location
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(project => 
        project.installationLocation.some(loc => selectedLocations.includes(loc))
      )
    }
    
    return filtered
  }, [selectedMaterials, selectedLocations])
  
  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage)
  
  // Get project image with fallback
  const getProjectImage = (project: typeof projects[0], index: number) => {
    if (project.heroImage && project.heroImage.startsWith('/images/')) {
      return project.heroImage
    }
    return fallbackImages[index % fallbackImages.length]
  }
  
  // Get material display name
  const getMaterialName = (material: MaterialType, locale: Locale): string => {
    const names: Record<MaterialType, Record<Locale, string>> = {
      silestone: { lv: 'Silestone', en: 'Silestone', ru: 'Silestone' },
      dekton: { lv: 'Dekton', en: 'Dekton', ru: 'Dekton' },
      granite: { lv: 'Granīts', en: 'Granite', ru: 'Гранит' },
      marble: { lv: 'Marmors', en: 'Marble', ru: 'Мрамор' },
    }
    return names[material][locale]
  }
  
  const materials: MaterialType[] = ['silestone', 'dekton', 'granite', 'marble']
  
  return (
    <>
      {/* Hero with enhanced animations */}
      <section className="relative pt-32 pb-20 bg-lago-dark overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-lago-gold/20 rounded-full animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i * 0.5}s`,
              }}
            />
          ))}
        </div>
        
        <div className="container-lg relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            {content.title[locale]}
          </h1>
          <p className="text-lago-muted text-lg max-w-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {content.subtitle[locale]}
          </p>
        </div>
      </section>

      {/* Enhanced Filter Section */}
      <section className="py-8 bg-lago-black border-b border-white/5 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-dots opacity-5" />
        
        <div className="container-lg relative z-10">
          {/* Material Filter */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-lago-gold flex-shrink-0" />
              <h3 className="text-white font-medium text-sm uppercase tracking-wider">
                {content.materialFilterLabel[locale]}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FilterButton
                onClick={() => {
                  setSelectedMaterials([])
                  setCurrentPage(1)
                }}
                isSelected={selectedMaterials.length === 0}
                className="px-8 py-4"
              >
                {locale === 'lv' ? 'Visi' : locale === 'en' ? 'All' : 'Все'}
              </FilterButton>
              {materials.map((material, index) => (
                <FilterButton
                  key={material}
                  onClick={() => toggleMaterial(material)}
                  isSelected={selectedMaterials.includes(material)}
                  className="px-8 py-4 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${100 + index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  {getMaterialName(material, locale)}
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Installation Location Filter */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-lago-gold flex-shrink-0" />
              <h3 className="text-white font-medium text-sm uppercase tracking-wider">
                {content.locationFilterLabel[locale]}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {installationLocations.map((location, index) => {
                const Icon = location.icon
                const isSelected = selectedLocations.includes(location.value)
                return (
                  <FilterButton
                    key={location.value}
                    onClick={() => toggleLocation(location.value)}
                    isSelected={isSelected}
                    className="px-3 py-3 opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${200 + index * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
                      <span className="text-xs leading-tight font-medium">{location.label[locale]}</span>
                    </div>
                  </FilterButton>
                )
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Projects Grid with enhanced animations */}
      <section className="py-12 bg-lago-black relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-5" />
        
        <div className="container-lg relative z-10">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-lago-gold/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-lago-gold" />
              </div>
              <p className="text-lago-muted text-lg">
                {content.noResults[locale]}
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProjects.map((project, index) => {
                  const projectImage = getProjectImage(project, startIndex + index)
                  
                  return (
                    <Link
                      key={project.id}
                      href={`/${locale}/${locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'}/${project.slug[locale]}`}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-lago-charcoal/50 backdrop-blur-sm border border-white/5 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/20 hover:-translate-y-2 opacity-0 animate-fade-in-up"
                      style={{ 
                        animationDelay: `${400 + index * 100}ms`, 
                        animationFillMode: 'forwards',
                        animation: filteredProjects.length > 0 ? undefined : 'none'
                      }}
                    >
                      {/* Project Image with parallax effect */}
                      <div className="relative h-full overflow-hidden">
                        <Image
                          src={projectImage}
                          alt={project.title[locale]}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                          quality={75} // PERFORMANCE: Reduced quality to save bandwidth
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-lago-black via-lago-black/60 to-lago-black/20 group-hover:from-lago-black/95 group-hover:via-lago-black/80 group-hover:to-lago-black/40 transition-all duration-500" />
                        
                        {/* Animated overlay pattern on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,169,98,0.1)_0%,transparent_70%)]" />
                        </div>
                        
                        {/* Material Badge */}
                        {project.material && (
                          <div className="absolute top-4 right-4 z-10">
                            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/30 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:bg-lago-gold/30 group-hover:border-lago-gold/50">
                              {getMaterialName(project.material, locale)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Project Info Overlay */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="transform transition-all duration-300 group-hover:translate-y-[-8px]">
                          <h3 className="text-xl md:text-2xl font-heading text-white mb-3 group-hover:text-lago-gold transition-colors duration-300">
                            {project.title[locale]}
                          </h3>
                        </div>
                        
                        <div className="mt-0 group-hover:mt-3 transition-all duration-300">
                          <p className="text-lago-light/80 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            {project.summary[locale]}
                          </p>
                        </div>
                        
                        {/* Installation Location Tags */}
                        {project.installationLocation.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300" style={{ transitionDelay: '100ms' }}>
                            {project.installationLocation.slice(0, 2).map((loc) => {
                              const locationData = installationLocations.find(l => l.value === loc)
                              if (!locationData) return null
                              const Icon = locationData.icon
                              return (
                                <span
                                  key={loc}
                                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-lago-light/70 text-xs rounded-md border border-white/10"
                                >
                                  <Icon className="w-3 h-3" />
                                  {locationData.label[locale]}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Location - bottom-right on hover */}
                      {project.location && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-lago-light/90 text-sm opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                          <MapPin className="w-4 h-4 text-lago-gold flex-shrink-0" />
                          <span className="font-medium text-right max-w-[180px] line-clamp-2">{project.location[locale]}</span>
                        </div>
                      )}
                      
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-t from-lago-gold/10 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,169,98,0.15)_0%,transparent_70%)]" />
                      </div>
                      
                      {/* Animated Border */}
                      <div className="absolute inset-0 border-2 border-lago-gold/0 group-hover:border-lago-gold/40 rounded-xl transition-all duration-500" />
                      
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lago-gold/0 group-hover:border-lago-gold/60 transition-all duration-300 rounded-tl-xl" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lago-gold/0 group-hover:border-lago-gold/60 transition-all duration-300 rounded-br-xl" />
                      
                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>
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
                  ? `Rāda ${startIndex + 1}-${Math.min(startIndex + projectsPerPage, filteredProjects.length)} no ${filteredProjects.length} projektiem`
                  : locale === 'en'
                  ? `Showing ${startIndex + 1}-${Math.min(startIndex + projectsPerPage, filteredProjects.length)} of ${filteredProjects.length} projects`
                  : `Показано ${startIndex + 1}-${Math.min(startIndex + projectsPerPage, filteredProjects.length)} из ${filteredProjects.length} проектов`}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
