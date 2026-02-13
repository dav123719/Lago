// ============================================
// ProjectCardEditable Component
// ============================================
// Project card with edit button visible to admins

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, MapPin } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { SanityProject } from '@/lib/sanity/types'

interface ProjectCardEditableProps {
  project: SanityProject
  locale: Locale
  isAdmin?: boolean
  onEdit?: (project: SanityProject) => void
  projectBasePath: string
}

export function ProjectCardEditable({
  project,
  locale,
  isAdmin = false,
  onEdit,
  projectBasePath,
}: ProjectCardEditableProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const title = project.title[locale]
  const summary = project.summary?.[locale]
  const location = project.location?.[locale]
  const slug = project.slug[locale]?.current || project.slug.lv?.current
  
  // Get hero image URL
  const heroImageUrl = (project.heroImage?.asset as { url?: string } | undefined)?.url || 
    (project.heroImage?.asset?._ref ? getSanityImageUrl(project.heroImage.asset._ref, 800) : '')

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(project)
  }

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`${projectBasePath}/${slug}`}
        className="block relative aspect-[4/3] overflow-hidden rounded-xl bg-lago-charcoal/50 backdrop-blur-sm border border-white/5 hover:border-lago-gold/50 transition-all duration-500 hover:shadow-2xl hover:shadow-lago-gold/20 hover:-translate-y-2"
      >
        {/* Project Image */}
        <div className="relative h-full overflow-hidden">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              quality={75}
            />
          ) : (
            <div className="w-full h-full bg-lago-charcoal flex items-center justify-center">
              <span className="text-lago-muted text-sm">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-lago-black via-lago-black/60 to-lago-black/20 group-hover:from-lago-black/95 group-hover:via-lago-black/80 group-hover:to-lago-black/40 transition-all duration-500" />
          
          {/* Material Badge */}
          {project.material && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/30 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:bg-lago-gold/30 group-hover:border-lago-gold/50">
                {project.material}
              </span>
            </div>
          )}
        </div>
        
        {/* Project Info Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="transform transition-all duration-300 group-hover:translate-y-[-8px]">
            <h3 className="text-xl md:text-2xl font-heading text-white mb-3 group-hover:text-lago-gold transition-colors duration-300">
              {title}
            </h3>
          </div>
          
          <div className="mt-0 group-hover:mt-3 transition-all duration-300">
            {summary && (
              <p className="text-lago-light/80 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                {summary}
              </p>
            )}
          </div>
          
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300" style={{ transitionDelay: '100ms' }}>
              {project.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white/5 text-lago-light/70 text-xs rounded-md border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Location */}
        {location && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-lago-light/90 text-sm opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
            <MapPin className="w-4 h-4 text-lago-gold flex-shrink-0" />
            <span className="font-medium text-right max-w-[180px] line-clamp-2">{location}</span>
          </div>
        )}
        
        {/* Hover Effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-lago-gold/10 via-transparent to-transparent" />
        </div>
        
        <div className="absolute inset-0 border-2 border-lago-gold/0 group-hover:border-lago-gold/40 rounded-xl transition-all duration-500" />
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lago-gold/0 group-hover:border-lago-gold/60 transition-all duration-300 rounded-tl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lago-gold/0 group-hover:border-lago-gold/60 transition-all duration-300 rounded-br-xl" />
      </Link>
      
      {/* Edit Button - Only visible to admins on hover */}
      {isAdmin && (
        <button
          onClick={handleEditClick}
          className={`absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-lago-gold text-lago-black flex items-center justify-center shadow-lg transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 -translate-y-2'
          } hover:bg-lago-gold-light hover:scale-110`}
          title="Edit Project"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Helper to build Sanity image URL
function getSanityImageUrl(ref: string, width: number): string {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  
  // Parse the reference
  const refParts = ref.replace('image-', '').split('-')
  const id = refParts[0]
  const dimensions = refParts[1] || '800x600'
  const format = refParts[2] || 'jpg'
  
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}?w=${width}&q=75&fm=webp`
}
