// ============================================
// Sanity Types for LAGO Projects
// ============================================
// TypeScript types matching Sanity schema

import { LocalizedString } from '@/lib/i18n/types'

// Base Sanity document
export interface SanityDocument {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  _rev?: string
}

// Image asset reference
export interface SanityImageAsset {
  _type: 'reference'
  _ref: string
}

export interface SanityImage {
  _type: 'image'
  asset: SanityImageAsset
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
  alt?: LocalizedString
  caption?: LocalizedString
}

// Slug type
export interface SanitySlug {
  _type: 'slug'
  current: string
}

// Block content (rich text)
export interface SanityBlock {
  _type: 'block'
  _key: string
  style: string
  children: Array<{
    _type: 'span'
    _key: string
    text: string
    marks: string[]
  }>
  markDefs: Array<{
    _type: string
    _key: string
    href?: string
  }>
}

// Material annotation in gallery
export interface GalleryMaterialAnnotation {
  area: LocalizedString
  material: string
  thickness?: string
  finish?: string
  notes?: LocalizedString
}

// Gallery image with annotations
export interface SanityGalleryImage extends SanityImage {
  materials?: GalleryMaterialAnnotation[]
}

// Quick facts
export interface QuickFactsData {
  area?: LocalizedString
  type?: LocalizedString
  materials?: LocalizedString
  scope?: LocalizedString
}

// Project story
export interface ProjectStoryData {
  goals?: {
    lv: SanityBlock[]
    en: SanityBlock[]
    ru: SanityBlock[]
  }
  challenges?: {
    lv: SanityBlock[]
    en: SanityBlock[]
    ru: SanityBlock[]
  }
  solution?: {
    lv: SanityBlock[]
    en: SanityBlock[]
    ru: SanityBlock[]
  }
}

// Material list item
export interface MaterialListItem {
  _key: string
  area: LocalizedString
  material: LocalizedString
  thickness?: LocalizedString
  finish?: LocalizedString
}

// Main Project type from Sanity
export interface SanityProject extends SanityDocument {
  _type: 'project'
  slug: {
    lv: SanitySlug
    en: SanitySlug
    ru: SanitySlug
  }
  title: LocalizedString
  subtitle?: LocalizedString
  category: 'stone' | 'furniture'
  material?: 'silestone' | 'dekton' | 'granite' | 'marble' | 'other'
  tags: string[]
  year?: number
  location?: LocalizedString
  summary?: LocalizedString
  body?: {
    lv: (SanityBlock | SanityImage)[]
    en: (SanityBlock | SanityImage)[]
    ru: (SanityBlock | SanityImage)[]
  }
  heroImage?: SanityImage
  gallery?: SanityGalleryImage[]
  quickFacts?: QuickFactsData
  story?: ProjectStoryData
  materialsList?: MaterialListItem[]
}

// Preview state
export interface PreviewState {
  enabled: boolean
  token?: string
}

// Helper type for project with resolved references
export type ResolvedProject = Omit<SanityProject, 'heroImage' | 'gallery'> & {
  heroImage?: SanityImage & { url?: string; dimensions?: { width: number; height: number } }
  gallery?: Array<SanityGalleryImage & { url?: string; dimensions?: { width: number; height: number } }>
}
