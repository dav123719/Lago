// ===================================
// Content Model Types
// ===================================
// Defines the structure for all content entities in the LAGO website

import { LocalizedString } from '@/lib/i18n/types'

// Base type for any content with localized slugs
export interface LocalizedContent {
  id: string
  slug: LocalizedString
}

// Page content type
export interface Page extends LocalizedContent {
  title: LocalizedString
  description: LocalizedString
  body: LocalizedString
  metaTitle?: LocalizedString
  metaDescription?: LocalizedString
}

// Material type (stone colors/finishes)
export type MaterialType = 'silestone' | 'dekton' | 'granite' | 'marble'

export interface MaterialColor {
  id: string
  name: LocalizedString
  description: LocalizedString
  image: string // placeholder path
  category?: string // e.g., 'light', 'dark', 'veined'
}

export interface Material extends LocalizedContent {
  name: LocalizedString
  type: MaterialType
  description: LocalizedString
  longDescription: LocalizedString
  features: LocalizedString[]
  colors: MaterialColor[]
  heroImage: string
}

// Furniture category type
export type FurnitureCategory = 'kitchens' | 'built-in' | 'interior-projects'

export interface FurnitureType extends LocalizedContent {
  name: LocalizedString
  category: FurnitureCategory
  description: LocalizedString
  longDescription: LocalizedString
  features: LocalizedString[]
  solutions: LocalizedString[]
  heroImage: string
  galleryImages: string[]
}

// Project type
export type ProjectCategory = 'stone' | 'furniture'
export type ProjectUse = 'kitchen' | 'bathroom' | 'commercial' | 'residential'
export type InstallationLocation = 'kitchen' | 'bathroom' | 'interior' | 'outdoor' | 'furniture' | 'commercial'

// Quick facts for project detail page
export interface QuickFacts {
  location?: LocalizedString
  area?: LocalizedString // e.g., "18 m² kitchen"
  type?: LocalizedString | string // Project type (can be LocalizedString or simple string key)
  materials?: LocalizedString // Main materials used
  completed?: number // Year
  scope?: LocalizedString // Measurement, fabrication, installation, etc.
}

// Story sections for project detail page
export interface ProjectStory {
  goals?: LocalizedString // Client goals
  challenges?: LocalizedString // Constraints and challenges
  solution?: LocalizedString // Our solution
}

// Material detail for a specific area
export interface MaterialDetail {
  area: LocalizedString // e.g., "Countertop", "Backsplash"
  material: LocalizedString // Material name
  thickness?: LocalizedString // e.g., "20 mm"
  finish?: LocalizedString // Finish type
  notes?: LocalizedString // Additional details
}

// Gallery image with optional material annotations
export interface GalleryImage {
  src: string
  alt?: LocalizedString
  materials?: MaterialDetail[] // Materials visible in this photo
}

export interface Project extends LocalizedContent {
  title: LocalizedString
  category: ProjectCategory
  tags: ProjectUse[]
  installationLocation: InstallationLocation[] // Where the project is installed
  location?: LocalizedString
  summary: LocalizedString
  body: LocalizedString
  heroImage: string
  galleryImages: string[] // Legacy - kept for backward compatibility
  year?: number
  material?: MaterialType // Material used in stone projects
  
  // New fields for detailed project layout
  subtitle?: LocalizedString // One-liner under title
  quickFacts?: QuickFacts
  story?: ProjectStory
  materials?: MaterialDetail[] // Materials & technical details
  gallery?: GalleryImage[] // Gallery with material annotations (replaces galleryImages if provided)
}

// Company information (not localized - same across all languages)
export interface CompanyInfo {
  name: string
  address: string
  city: string
  country: string
  postalCode: string
  phone: string
  email: string
  workingHours: LocalizedString
  mapEmbedUrl?: string
}

