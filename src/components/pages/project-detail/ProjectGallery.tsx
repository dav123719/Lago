'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Locale } from '@/lib/i18n/config'
import { Project, GalleryImage } from '@/content/types'
import { X, ChevronLeft, ChevronRight, Layers } from 'lucide-react'

interface ProjectGalleryProps {
  project: Project
  locale: Locale
}

export function ProjectGallery({ project, locale }: ProjectGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // Get gallery images - use new gallery format if available, otherwise fallback to legacy
  const galleryImages: GalleryImage[] = project.gallery && project.gallery.length > 0
    ? project.gallery
    : (project.galleryImages || []).map(src => ({ src }))

  if (galleryImages.length === 0) return null

  const openLightbox = (index: number) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return
    if (direction === 'prev') {
      setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1)
    } else {
      setSelectedImage(selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1)
    }
  }

  return (
    <>
      <section className="py-24 bg-lago-black">
        <div className="container-lg">
          {/* Section Header */}
          <div className="text-center mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-lago-gold/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-lago-gold" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading text-white">
                {locale === 'lv' ? 'Projekta galerija' : locale === 'en' ? 'Project Gallery' : 'Галерея проекта'}
              </h2>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${150 + index * 50}ms`, animationFillMode: 'forwards' }}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image.src}
                  alt={image.alt?.[locale] || `${project.title[locale]} - ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={75}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loading={index < 6 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lago-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Material Labels Overlay */}
                {image.materials && image.materials.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-lago-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-xs text-lago-gold font-medium uppercase tracking-wider mb-2">
                      {locale === 'lv' ? 'Materiāli šajā foto:' : locale === 'en' ? 'Materials in this photo:' : 'Материалы на фото:'}
                    </div>
                    <div className="space-y-1">
                      {image.materials.map((material, matIndex) => (
                        <div key={matIndex} className="text-sm text-white">
                          <span className="font-medium">{material.area[locale]}</span>
                          {' – '}
                          <span>{material.material[locale]}</span>
                          {material.thickness && `, ${material.thickness[locale]}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              navigateImage('prev')
            }}
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              navigateImage('next')
            }}
            className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 min-h-0">
              <Image
                src={galleryImages[selectedImage].src}
                alt={galleryImages[selectedImage].alt?.[locale] || `${project.title[locale]} - ${selectedImage + 1}`}
                fill
                sizes="100vw"
                quality={90}
                className="object-contain"
                priority
              />
            </div>

            {/* Material Details Below Image */}
            {galleryImages[selectedImage].materials && galleryImages[selectedImage].materials!.length > 0 && (
              <div className="mt-4 p-6 bg-lago-charcoal/90 rounded-xl border border-white/10 max-w-4xl mx-auto">
                <div className="text-sm text-lago-gold font-medium uppercase tracking-wider mb-3">
                  {locale === 'lv' ? 'Materiāli šajā foto:' : locale === 'en' ? 'Materials in this photo:' : 'Материалы на фото:'}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {galleryImages[selectedImage].materials!.map((material, matIndex) => (
                    <div key={matIndex} className="text-white">
                      <span className="font-medium">{material.area[locale]}</span>
                      {' – '}
                      <span>{material.material[locale]}</span>
                      {material.thickness && `, ${material.thickness[locale]}`}
                      {material.finish && `, ${material.finish[locale]}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
              {selectedImage + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

