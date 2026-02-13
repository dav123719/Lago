// ============================================
// Projects Page Client Component
// ============================================
// Interactive projects listing with admin edit features

'use client'

import { useState, useMemo, useCallback } from 'react'
import { Locale } from '@/lib/i18n/config'
import { SanityProject } from '@/lib/sanity/types'
import { ProjectCardEditable } from '@/components/projects/ProjectCardEditable'
import { EditProjectModal } from '@/components/projects/EditProjectModal'
import { toast } from 'sonner'
import { 
  MapPin, 
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

// Material types for filtering
type MaterialType = 'silestone' | 'dekton' | 'granite' | 'marble'
type InstallationLocation = 'kitchen' | 'bathroom' | 'interior' | 'outdoor' | 'furniture' | 'commercial'

interface ProjectsPageClientProps {
  projects: SanityProject[]
  locale: Locale
  isAdmin: boolean
  projectsBasePath: string
}

// Filter Button Component
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
  return (
    <button
      onClick={onClick}
      className={[
        className,
        'group/btn relative rounded-xl font-medium text-base transition-all duration-300 transform hover:scale-105 overflow-hidden',
        isSelected
          ? 'bg-lago-gold text-lago-black shadow-lg shadow-lago-gold/30 scale-105 border-0 ring-2 ring-lago-gold/40'
          : 'bg-lago-charcoal/50 text-lago-light hover:bg-lago-charcoal hover:text-white border border-white/10 hover:border-lago-gold/30'
      ].filter(Boolean).join(' ')}
      style={style}
    >
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export function ProjectsPageClient({
  projects,
  locale,
  isAdmin,
  projectsBasePath,
}: ProjectsPageClientProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialType[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [editingProject, setEditingProject] = useState<SanityProject | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const projectsPerPage = 6

  const content = {
    title: { 
      lv: 'Projekti', 
      en: 'Projects', 
      ru: 'Проекты' 
    },
    subtitle: {
      lv: 'Apskatiet mūsu realizētos projektus - no privātām virtuvēm līdz komerciālajiem objektiem.',
      en: 'View our completed projects - from private kitchens to commercial spaces.',
      ru: 'Посмотрите наши реализованные проекты.',
    },
    materialFilterLabel: {
      lv: 'Filtrēt pēc materiāla',
      en: 'Filter by material',
      ru: 'Фильтр по материалу',
    },
    tagFilterLabel: {
      lv: 'Filtrēt pēc veida',
      en: 'Filter by type',
      ru: 'Фильтр по типу',
    },
    noResults: {
      lv: 'Nav atrasti projekti ar izvēlētajiem filtriem.',
      en: 'No projects found with the selected filters.',
      ru: 'Проекты с выбранными фильтрами не найдены.',
    },
  }

  const materials: MaterialType[] = ['silestone', 'dekton', 'granite', 'marble']

  const installationLocations = [
    { value: 'kitchen', icon: ChefHat, label: { lv: 'Virtuve', en: 'Kitchen', ru: 'Кухня' } },
    { value: 'bathroom', icon: Droplet, label: { lv: 'Vannas istaba', en: 'Bathroom', ru: 'Ванная' } },
    { value: 'interior', icon: Home, label: { lv: 'Interjers', en: 'Interior', ru: 'Интерьер' } },
    { value: 'outdoor', icon: TreePine, label: { lv: 'Āra zona', en: 'Outdoor', ru: 'Уличная' } },
    { value: 'furniture', icon: Sofa, label: { lv: 'Mēbeles', en: 'Furniture', ru: 'Мебель' } },
    { value: 'commercial', icon: Building2, label: { lv: 'Komerciāls', en: 'Commercial', ru: 'Коммерческий' } },
  ]

  // Toggle material filter
  const toggleMaterial = (material: MaterialType) => {
    setSelectedMaterials(prev => 
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    )
    setCurrentPage(1)
  }

  // Toggle tag filter
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    setCurrentPage(1)
  }

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects
    
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(project => 
        project.material && selectedMaterials.includes(project.material as MaterialType)
      )
    }
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter(project => 
        project.tags?.some(tag => selectedTags.includes(tag))
      )
    }
    
    return filtered
  }, [projects, selectedMaterials, selectedTags])

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage)

  // Handle edit
  const handleEdit = useCallback((project: SanityProject) => {
    if (!isAdmin) {
      toast.error('Admin access required')
      return
    }
    setEditingProject(project)
    setIsEditModalOpen(true)
  }, [isAdmin])

  // Handle save
  const handleSave = async (updates: Partial<SanityProject>) => {
    if (!editingProject) return

    try {
      const response = await fetch('/api/projects/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: editingProject._id,
          updates,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      toast.success('Project updated successfully')
      // Refresh page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to update project')
      throw error
    }
  }

  const getMaterialName = (material: MaterialType): string => {
    const names: Record<MaterialType, string> = {
      silestone: 'Silestone',
      dekton: 'Dekton',
      granite: locale === 'lv' ? 'Granīts' : locale === 'ru' ? 'Гранит' : 'Granite',
      marble: locale === 'lv' ? 'Marmors' : locale === 'ru' ? 'Мрамор' : 'Marble',
    }
    return names[material]
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-lago-dark overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lago-gold/5 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        
        <div className="container-lg relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            {content.title[locale]}
          </h1>
          <p className="text-lago-muted text-lg max-w-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {content.subtitle[locale]}
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-lago-black border-b border-white/5 relative overflow-hidden">
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
                  {getMaterialName(material)}
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-lago-gold flex-shrink-0" />
              <h3 className="text-white font-medium text-sm uppercase tracking-wider">
                {content.tagFilterLabel[locale]}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {installationLocations.map((location, index) => {
                const Icon = location.icon
                const isSelected = selectedTags.includes(location.value)
                return (
                  <FilterButton
                    key={location.value}
                    onClick={() => toggleTag(location.value)}
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

      {/* Projects Grid */}
      <section className="py-12 bg-lago-black relative overflow-hidden">
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
                {paginatedProjects.map((project, index) => (
                  <ProjectCardEditable
                    key={project._id}
                    project={project}
                    locale={locale}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    projectBasePath={projectsBasePath}
                  />
                ))}
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

      {/* Edit Modal */}
      <EditProjectModal
        project={editingProject}
        locale={locale}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingProject(null)
        }}
        onSave={handleSave}
      />
    </>
  )
}
