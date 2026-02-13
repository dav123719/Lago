// ============================================
// Sanity Utility Functions
// ============================================

import { Locale } from '@/lib/i18n/config'
import { LocalizedString } from '@/lib/i18n/types'
import { 
  SanityProject, 
  SanityBlock, 
  SanityImage, 
  SanityGalleryImage 
} from './types'
import type { 
  Project, 
  QuickFacts, 
  ProjectStory, 
  MaterialDetail, 
  GalleryImage 
} from '@/content/types'

/**
 * Convert Sanity rich text blocks to plain text
 */
export function blocksToText(blocks: (SanityBlock | SanityImage)[] | undefined): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  
  return blocks
    .filter((block): block is SanityBlock => block._type === 'block')
    .map(block => 
      block.children
        .filter(child => child._type === 'span')
        .map(child => child.text)
        .join('')
    )
    .join('\n\n')
}

/**
 * Get image URL from Sanity image
 */
export function getSanityImageUrl(
  image: SanityImage | undefined,
  options: { width?: number; height?: number; quality?: number; format?: 'webp' | 'avif' } = {}
): string {
  if (!image?.asset) return ''

  // If we have a resolved URL from the query
  if (typeof image.asset === 'object' && 'url' in image.asset) {
    return (image.asset as { url: string }).url || ''
  }

  // Build URL from reference
  const ref = image.asset._ref
  if (!ref) return ''

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  
  // Parse the reference
  const refParts = ref.replace('image-', '').split('-')
  const id = refParts[0]
  const dimensions = refParts[1] || '800x600'
  const format = refParts[2] || 'jpg'
  
  const params = new URLSearchParams()
  if (options.width) params.set('w', options.width.toString())
  if (options.height) params.set('h', options.height.toString())
  if (options.quality) params.set('q', options.quality.toString())
  if (options.format) params.set('fm', options.format)
  
  const paramsString = params.toString()
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}${paramsString ? `?${paramsString}` : ''}`
}

/**
 * Convert Sanity gallery image to app GalleryImage format
 */
function convertGalleryImage(img: SanityGalleryImage, locale: Locale): GalleryImage {
  const src = getSanityImageUrl(img)
  
  return {
    src,
    alt: img.alt,
    materials: img.materials?.map(m => ({
      area: m.area,
      material: { 
        lv: m.material, 
        en: m.material, 
        ru: m.material 
      },
      thickness: m.thickness ? { 
        lv: m.thickness, 
        en: m.thickness, 
        ru: m.thickness 
      } : undefined,
      finish: m.finish ? { 
        lv: m.finish, 
        en: m.finish, 
        ru: m.finish 
      } : undefined,
      notes: m.notes,
    })),
  }
}

/**
 * Convert Sanity materials list to app MaterialDetail format
 */
function convertMaterialsList(materials: SanityProject['materialsList']): MaterialDetail[] {
  if (!materials) return []
  
  return materials.map(m => ({
    area: m.area,
    material: m.material,
    thickness: m.thickness,
    finish: m.finish,
  }))
}

/**
 * Convert Sanity quick facts to app QuickFacts format
 */
function convertQuickFacts(
  quickFacts: SanityProject['quickFacts'],
  year: number | undefined
): QuickFacts {
  return {
    location: (quickFacts as { location?: { lv: string; en: string; ru: string } })?.location,
    area: quickFacts?.area,
    type: quickFacts?.type,
    materials: quickFacts?.materials,
    scope: quickFacts?.scope,
    completed: year,
  }
}

/**
 * Convert Sanity story to app ProjectStory format
 */
function convertStory(story: SanityProject['story']): ProjectStory {
  if (!story) return {}
  
  return {
    goals: {
      lv: blocksToText(story.goals?.lv),
      en: blocksToText(story.goals?.en),
      ru: blocksToText(story.goals?.ru),
    },
    challenges: {
      lv: blocksToText(story.challenges?.lv),
      en: blocksToText(story.challenges?.en),
      ru: blocksToText(story.challenges?.ru),
    },
    solution: {
      lv: blocksToText(story.solution?.lv),
      en: blocksToText(story.solution?.en),
      ru: blocksToText(story.solution?.ru),
    },
  }
}

/**
 * Convert Sanity body to app body format
 */
function convertBody(body: SanityProject['body']): LocalizedString {
  if (!body) return { lv: '', en: '', ru: '' }
  
  return {
    lv: blocksToText(body.lv),
    en: blocksToText(body.en),
    ru: blocksToText(body.ru),
  }
}

/**
 * Convert Sanity project to app Project format
 * This ensures backward compatibility with existing components
 */
export function convertSanityProject(project: SanityProject, locale: Locale): Project {
  // Convert gallery images
  const gallery: GalleryImage[] = project.gallery?.map(img => 
    convertGalleryImage(img, locale)
  ) || []

  // Convert materials list
  const materials: MaterialDetail[] = convertMaterialsList(project.materialsList)

  // Convert quick facts
  const quickFacts: QuickFacts = convertQuickFacts(project.quickFacts, project.year)

  // Convert story
  const story: ProjectStory = convertStory(project.story)

  // Convert body
  const body = convertBody(project.body)

  // Get hero image URL
  const heroImage = getSanityImageUrl(project.heroImage)

  // Get gallery images for legacy galleryImages field
  const galleryImages = gallery.map(g => g.src).filter(Boolean)

  // Derive installation locations from tags
  const validLocations = ['kitchen', 'bathroom', 'interior', 'outdoor', 'furniture', 'commercial']
  const installationLocation = project.tags?.filter(tag => 
    validLocations.includes(tag)
  ) || []

  return {
    id: project._id,
    slug: {
      lv: project.slug.lv?.current || '',
      en: project.slug.en?.current || '',
      ru: project.slug.ru?.current || '',
    },
    title: project.title,
    subtitle: project.subtitle,
    category: project.category,
    material: project.material as 'silestone' | 'dekton' | 'granite' | 'marble' | undefined,
    tags: (project.tags || []) as ('kitchen' | 'bathroom' | 'commercial' | 'residential')[],
    installationLocation: installationLocation as ('kitchen' | 'bathroom' | 'interior' | 'outdoor' | 'furniture' | 'commercial')[],
    location: project.location,
    summary: project.summary || { lv: '', en: '', ru: '' },
    body,
    heroImage,
    galleryImages,
    year: project.year,
    quickFacts,
    story,
    materials,
    gallery,
  }
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(imageRef: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  
  const refParts = imageRef.replace('image-', '').split('-')
  const id = refParts[0]
  const dimensions = refParts[1] || '800x600'
  const format = refParts[2] || 'jpg'
  
  return widths
    .map(width => {
      const url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}?w=${width}&q=75&fm=webp`
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Check if project matches filters
 */
export function projectMatchesFilters(
  project: SanityProject,
  filters: {
    materials?: string[]
    tags?: string[]
    category?: string
  }
): boolean {
  if (filters.category && project.category !== filters.category) {
    return false
  }
  
  if (filters.materials?.length && !filters.materials.includes(project.material || '')) {
    return false
  }
  
  if (filters.tags?.length && !filters.tags.some(tag => project.tags?.includes(tag))) {
    return false
  }
  
  return true
}
