// ============================================
// Sanity GROQ Queries for LAGO Projects
// ============================================

import { groq } from 'next-sanity'

// Fragments for reusable query parts

// Localized string fragment
const localizedString = groq`
  {
    "lv": lv,
    "en": en,
    "ru": ru
  }
`

// Image fragment with metadata
const imageFragment = groq`
  {
    "_type": _type,
    "asset": asset->{
      _id,
      url,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        },
        lqip,
        palette {
          dominant {
            background,
            foreground
          }
        }
      }
    },
    hotspot,
    crop,
    "alt": alt${localizedString},
    "caption": caption${localizedString}
  }
`

// Gallery image with materials annotation
const galleryImageFragment = groq`
  {
    "_type": _type,
    "asset": asset->{
      _id,
      url,
      metadata {
        dimensions {
          width,
          height
        },
        lqip
      }
    },
    hotspot,
    crop,
    "alt": alt${localizedString},
    "materials": materials[] {
      "area": area${localizedString},
      material,
      thickness,
      finish,
      "notes": notes${localizedString}
    }
  }
`

// Quick facts fragment
const quickFactsFragment = groq`
  {
    "area": area${localizedString},
    "type": type${localizedString},
    "materials": materials${localizedString},
    "scope": scope${localizedString}
  }
`

// Story fragment
const storyFragment = groq`
  {
    "goals": {
      "lv": goals.lv[],
      "en": goals.en[],
      "ru": goals.ru[]
    },
    "challenges": {
      "lv": challenges.lv[],
      "en": challenges.en[],
      "ru": challenges.ru[]
    },
    "solution": {
      "lv": solution.lv[],
      "en": solution.en[],
      "ru": solution.ru[]
    }
  }
`

// Materials list fragment
const materialsListFragment = groq`
  [
    ...materialsList[] {
      "_key": _key,
      "area": area${localizedString},
      "material": material${localizedString},
      "thickness": thickness${localizedString},
      "finish": finish${localizedString}
    }
  ]
`

// ============================================
// MAIN QUERIES
// ============================================

// Get all projects for listing (lightweight)
export const projectsByLocaleQuery = groq`
  *[_type == "project" && defined(slug)] | order(_createdAt desc) {
    _id,
    "_type": _type,
    "slug": {
      "lv": slug.lv.current,
      "en": slug.en.current,
      "ru": slug.ru.current
    },
    "title": title${localizedString},
    "subtitle": subtitle${localizedString},
    category,
    material,
    tags,
    year,
    "location": location${localizedString},
    "summary": summary${localizedString},
    "heroImage": heroImage${imageFragment}
  }
`

// Get single project by slug
export const projectBySlugQuery = groq`
  *[_type == "project" && (slug.lv.current == $slug || slug.en.current == $slug || slug.ru.current == $slug)][0] {
    _id,
    "_type": _type,
    _createdAt,
    _updatedAt,
    "slug": {
      "lv": slug.lv.current,
      "en": slug.en.current,
      "ru": slug.ru.current
    },
    "title": title${localizedString},
    "subtitle": subtitle${localizedString},
    category,
    material,
    tags,
    year,
    "location": location${localizedString},
    "summary": summary${localizedString},
    "body": {
      "lv": body.lv[]{
        ...,
        _type == "image" => ${imageFragment}
      },
      "en": body.en[]{
        ...,
        _type == "image" => ${imageFragment}
      },
      "ru": body.ru[]{
        ...,
        _type == "image" => ${imageFragment}
      }
    },
    "heroImage": heroImage${imageFragment},
    "gallery": gallery[] ${galleryImageFragment},
    "quickFacts": quickFacts${quickFactsFragment},
    "story": story${storyFragment},
    "materialsList": ${materialsListFragment}
  }
`

// Get featured projects
export const featuredProjectsQuery = groq`
  *[_type == "project" && defined(slug) && featured == true] | order(_createdAt desc)[0...6] {
    _id,
    "slug": {
      "lv": slug.lv.current,
      "en": slug.en.current,
      "ru": slug.ru.current
    },
    "title": title${localizedString},
    "subtitle": subtitle${localizedString},
    category,
    material,
    tags,
    year,
    "location": location${localizedString},
    "summary": summary${localizedString},
    "heroImage": heroImage${imageFragment}
  }
`

// Get projects by category
export const projectsByCategoryQuery = groq`
  *[_type == "project" && category == $category && defined(slug)] | order(_createdAt desc) {
    _id,
    "slug": {
      "lv": slug.lv.current,
      "en": slug.en.current,
      "ru": slug.ru.current
    },
    "title": title${localizedString},
    "subtitle": subtitle${localizedString},
    category,
    material,
    tags,
    year,
    "location": location${localizedString},
    "summary": summary${localizedString},
    "heroImage": heroImage${imageFragment}
  }
`

// Get projects by tag
export const projectsByTagQuery = groq`
  *[_type == "project" && $tag in tags && defined(slug)] | order(_createdAt desc) {
    _id,
    "slug": {
      "lv": slug.lv.current,
      "en": slug.en.current,
      "ru": slug.ru.current
    },
    "title": title${localizedString},
    "subtitle": subtitle${localizedString},
    category,
    material,
    tags,
    year,
    "location": location${localizedString},
    "summary": summary${localizedString},
    "heroImage": heroImage${imageFragment}
  }
`

// Get projects by material
export const projectsByMaterialQuery = groq`
  *[_type == "project" && material == $material && defined(slug)] | order(_createdAt desc) {
    _id,
    "slug": {
      "lv": slug.lv.current,
      "en": slug.en.current,
      "ru": slug.ru.current
    },
    "title": title${localizedString},
    "subtitle": subtitle${localizedString},
    category,
    material,
    tags,
    year,
    "location": location${localizedString},
    "summary": summary${localizedString},
    "heroImage": heroImage${imageFragment}
  }
`

// Get all project slugs (for static generation)
export const allProjectSlugsQuery = groq`
  *[_type == "project" && defined(slug)] {
    "slug": slug
  }
`

// Get project count
export const projectCountQuery = groq`
  count(*[_type == "project"])
`

// Search projects
export const searchProjectsQuery = groq`
  *[_type == "project" && (
    title.lv match $search + "*" ||
    title.en match $search + "*" ||
    title.ru match $search + "*" ||
    summary.lv match $search + "*" ||
    summary.en match $search + "*" ||
    summary.ru match $search + "*"
  )] | order(_createdAt desc) {
    _id,
    "slug": {
      "lv": slug.lv.current,
      "en": slug.en.current,
      "ru": slug.ru.current
    },
    "title": title${localizedString},
    "subtitle": subtitle${localizedString},
    category,
    material,
    tags,
    year,
    "location": location${localizedString},
    "summary": summary${localizedString},
    "heroImage": heroImage${imageFragment}
  }
`
