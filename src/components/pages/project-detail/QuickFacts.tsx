'use client'

import { Locale } from '@/lib/i18n/config'
import { QuickFacts as QuickFactsType, Project, MaterialDetail } from '@/content/types'
import { MapPin, Tag, Calendar, Layers, Ruler, Sparkles } from 'lucide-react'

interface QuickFactsProps {
  project: Project
  locale: Locale
}

export function QuickFacts({ project, locale }: QuickFactsProps) {
  const facts = project.quickFacts || {}
  
  // Fallback to project data if quickFacts not provided
  const location = facts.location || project.location
  const completed = facts.completed || project.year
  
  // Get type - handle both LocalizedString and string
  let typeValue: string = ''
  if (facts.type) {
    typeValue = typeof facts.type === 'string' ? facts.type : facts.type[locale]
  } else {
    const typeKey = project.installationLocation[0] || project.tags[0] || ''
    typeValue = typeKey
  }
  
  // Type labels
  const typeLabels: Record<string, Record<Locale, string>> = {
    kitchen: { lv: 'Virtuve', en: 'Kitchen', ru: 'Кухня' },
    bathroom: { lv: 'Vannas istaba', en: 'Bathroom', ru: 'Ванная' },
    commercial: { lv: 'Komerciāls', en: 'Commercial', ru: 'Коммерческий' },
    residential: { lv: 'Dzīvojamais', en: 'Residential', ru: 'Жилой' },
    outdoor: { lv: 'Āra zona', en: 'Outdoor', ru: 'Уличная зона' },
    interior: { lv: 'Interjers', en: 'Interior', ru: 'Интерьер' },
    furniture: { lv: 'Mēbeles', en: 'Furniture', ru: 'Мебель' },
  }

  // Only keep Location and Completed (Type is removed)
  const factItems = [
    location && {
      icon: MapPin,
      label: locale === 'lv' ? 'Atrašanās vieta' : locale === 'en' ? 'Location' : 'Местоположение',
      value: location[locale],
    },
    completed && {
      icon: Calendar,
      label: locale === 'lv' ? 'Pabeigts' : locale === 'en' ? 'Completed' : 'Завершено',
      value: completed.toString(),
    },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string }>

  // Get materials
  const materials = project.materials || []
  
  // If no materials provided but material exists, create a basic entry
  if (materials.length === 0 && project.material) {
    const materialLabels: Record<string, Record<Locale, string>> = {
      silestone: { lv: 'Silestone', en: 'Silestone', ru: 'Silestone' },
      dekton: { lv: 'Dekton', en: 'Dekton', ru: 'Dekton' },
      granite: { lv: 'Granīts', en: 'Granite', ru: 'Гранит' },
      marble: { lv: 'Marmors', en: 'Marble', ru: 'Мрамор' },
    }

    materials.push({
      area: {
        lv: 'Galvenais materiāls',
        en: 'Main Material',
        ru: 'Основной материал',
      },
      material: materialLabels[project.material] || { lv: project.material, en: project.material, ru: project.material },
    })
  }

  const hasContent = factItems.length > 0 || materials.length > 0
  if (!hasContent) return null

  return (
    <section className="py-24 bg-lago-dark border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="container-lg relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Unified Container with Two-Column Layout */}
          <div className="bg-lago-charcoal/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12 lg:p-16 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              
              {/* Column 1: Project Facts */}
              {factItems.length > 0 && (
                <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                  {/* Section Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-lago-gold/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-lago-gold" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-heading text-white">
                        {locale === 'lv' ? 'Projekta fakti' : locale === 'en' ? 'Project Facts' : 'Факты проекта'}
                      </h2>
                    </div>
                    <p className="text-lago-muted text-sm">
                      {locale === 'lv' ? 'Pamatinformācija par projektu' : locale === 'en' ? 'Basic project information' : 'Основная информация о проекте'}
                    </p>
                  </div>

                  {/* Facts List */}
                  <div className="space-y-6">
                    {factItems.map((item, index) => (
                      <div
                        key={index}
                        className="group flex items-start gap-4 p-4 rounded-lg bg-lago-dark/50 border border-white/5 hover:border-lago-gold/20 transition-all duration-300 hover:bg-lago-dark/70"
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-lago-gold/10 flex items-center justify-center group-hover:bg-lago-gold/20 transition-colors duration-300">
                          <item.icon className="w-5 h-5 text-lago-gold" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-lago-muted uppercase tracking-wider font-semibold mb-1.5">
                            {item.label}
                          </div>
                          <div className="text-base md:text-lg text-white font-medium group-hover:text-lago-gold transition-colors duration-300">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Column 2: Materials & Technical Details */}
              {materials.length > 0 && (
                <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                  {/* Section Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-lago-gold/10 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-lago-gold" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-heading text-white">
                        {locale === 'lv' ? 'Materiāli un detaļi' : locale === 'en' ? 'Materials & Details' : 'Материалы и детали'}
                      </h2>
                    </div>
                    <p className="text-lago-muted text-sm">
                      {locale === 'lv' ? 'Detalizēta informācija par izmantotajiem materiāliem' : locale === 'en' ? 'Detailed information about materials used' : 'Подробная информация об используемых материалах'}
                    </p>
                  </div>

                  {/* Materials List */}
                  <div className="space-y-4">
                    {materials.map((material, index) => (
                      <div
                        key={index}
                        className="group p-5 rounded-lg bg-lago-dark/50 border border-white/5 hover:border-lago-gold/20 transition-all duration-300 hover:bg-lago-dark/70 hover:shadow-lg hover:shadow-lago-gold/5"
                      >
                        {/* Area Name */}
                        <h3 className="text-lg font-heading text-white mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-lago-gold" />
                          {material.area[locale]}
                        </h3>

                        {/* Material Details */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <span className="text-lago-muted text-xs min-w-[70px]">
                              {locale === 'lv' ? 'Materiāls:' : locale === 'en' ? 'Material:' : 'Материал:'}
                            </span>
                            <span className="text-lago-light text-sm font-medium">{material.material[locale]}</span>
                          </div>

                          {material.thickness && (
                            <div className="flex items-start gap-3">
                              <Ruler className="w-3.5 h-3.5 text-lago-muted mt-0.5 flex-shrink-0" />
                              <span className="text-lago-muted text-xs min-w-[70px]">
                                {locale === 'lv' ? 'Biezums:' : locale === 'en' ? 'Thickness:' : 'Толщина:'}
                              </span>
                              <span className="text-lago-light text-sm">{material.thickness[locale]}</span>
                            </div>
                          )}

                          {material.finish && (
                            <div className="flex items-start gap-3">
                              <span className="text-lago-muted text-xs min-w-[70px]">
                                {locale === 'lv' ? 'Apdare:' : locale === 'en' ? 'Finish:' : 'Отделка:'}
                              </span>
                              <span className="text-lago-light text-sm">{material.finish[locale]}</span>
                            </div>
                          )}

                          {material.notes && (
                            <div className="mt-3 pt-3 border-t border-white/5">
                              <p className="text-lago-muted text-xs leading-relaxed">{material.notes[locale]}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

