'use client'

import { Locale } from '@/lib/i18n/config'
import { Project, MaterialDetail } from '@/content/types'
import { Layers, Ruler, Sparkles } from 'lucide-react'

interface MaterialsDetailsProps {
  project: Project
  locale: Locale
}

export function MaterialsDetails({ project, locale }: MaterialsDetailsProps) {
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

  if (materials.length === 0) return null

  return (
    <section className="py-24 bg-lago-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="container-lg relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-lago-gold/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-lago-gold" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading text-white">
                {locale === 'lv' ? 'Materiāli un tehniskie detaļi' : locale === 'en' ? 'Materials & Technical Details' : 'Материалы и технические детали'}
              </h2>
            </div>
            <p className="text-lago-muted text-lg">
              {locale === 'lv' ? 'Detalizēta informācija par izmantotajiem materiāliem un to specifikācijām' : locale === 'en' ? 'Detailed information about materials used and their specifications' : 'Подробная информация об используемых материалах и их спецификациях'}
            </p>
          </div>

          {/* Materials Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {materials.map((material, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl bg-lago-charcoal/50 border border-white/10 hover:border-lago-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-lago-gold/10 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: 'forwards' }}
              >
                {/* Area Name */}
                <h3 className="text-xl font-heading text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-lago-gold" />
                  {material.area[locale]}
                </h3>

                {/* Material Details */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="text-lago-muted text-sm min-w-[80px]">
                      {locale === 'lv' ? 'Materiāls:' : locale === 'en' ? 'Material:' : 'Материал:'}
                    </span>
                    <span className="text-lago-light font-medium">{material.material[locale]}</span>
                  </div>

                  {material.thickness && (
                    <div className="flex items-start gap-3">
                      <Ruler className="w-4 h-4 text-lago-muted mt-0.5" />
                      <span className="text-lago-muted text-sm min-w-[80px]">
                        {locale === 'lv' ? 'Biezums:' : locale === 'en' ? 'Thickness:' : 'Толщина:'}
                      </span>
                      <span className="text-lago-light">{material.thickness[locale]}</span>
                    </div>
                  )}

                  {material.finish && (
                    <div className="flex items-start gap-3">
                      <span className="text-lago-muted text-sm min-w-[80px]">
                        {locale === 'lv' ? 'Apdare:' : locale === 'en' ? 'Finish:' : 'Отделка:'}
                      </span>
                      <span className="text-lago-light">{material.finish[locale]}</span>
                    </div>
                  )}

                  {material.notes && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-lago-muted text-sm leading-relaxed">{material.notes[locale]}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

