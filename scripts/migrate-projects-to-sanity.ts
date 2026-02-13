#!/usr/bin/env tsx
// ============================================
// Migration Script: Projects to Sanity
// ============================================
// Converts existing src/content/projects.ts to Sanity documents
// Usage: npx tsx scripts/migrate-projects-to-sanity.ts

import { createClient } from '@sanity/client'
import { projects } from '../src/content/projects'
import { Project } from '../src/content/types'

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

// Validate configuration
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.error('Error: NEXT_PUBLIC_SANITY_PROJECT_ID is required')
  process.exit(1)
}

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Error: SANITY_API_WRITE_TOKEN is required')
  process.exit(1)
}

// Convert project to Sanity document format
function convertProjectToSanity(project: Project) {
  return {
    _type: 'project',
    _id: `project-${project.id}`,
    slug: {
      _type: 'slug',
      lv: { _type: 'slug', current: project.slug.lv },
      en: { _type: 'slug', current: project.slug.en },
      ru: { _type: 'slug', current: project.slug.ru },
    },
    title: project.title,
    subtitle: project.subtitle,
    category: project.category,
    material: project.material,
    tags: project.tags,
    year: project.year,
    location: project.location,
    summary: project.summary,
    body: {
      lv: convertTextToBlocks(project.body.lv),
      en: convertTextToBlocks(project.body.en),
      ru: convertTextToBlocks(project.body.ru),
    },
    // Note: Images need to be uploaded separately
    // This creates references that you'll need to update after uploading images
    quickFacts: project.quickFacts ? {
      location: project.quickFacts.location,
      area: project.quickFacts.area,
      type: typeof project.quickFacts.type === 'string' 
        ? { lv: project.quickFacts.type, en: project.quickFacts.type, ru: project.quickFacts.type }
        : project.quickFacts.type,
      materials: project.quickFacts.materials,
      scope: project.quickFacts.scope,
    } : undefined,
    story: project.story ? {
      goals: {
        lv: convertTextToBlocks(project.story.goals?.lv || ''),
        en: convertTextToBlocks(project.story.goals?.en || ''),
        ru: convertTextToBlocks(project.story.goals?.ru || ''),
      },
      challenges: {
        lv: convertTextToBlocks(project.story.challenges?.lv || ''),
        en: convertTextToBlocks(project.story.challenges?.en || ''),
        ru: convertTextToBlocks(project.story.challenges?.ru || ''),
      },
      solution: {
        lv: convertTextToBlocks(project.story.solution?.lv || ''),
        en: convertTextToBlocks(project.story.solution?.en || ''),
        ru: convertTextToBlocks(project.story.solution?.ru || ''),
      },
    } : undefined,
    materialsList: project.materials?.map(m => ({
      _type: 'object',
      _key: Math.random().toString(36).substring(2, 11),
      area: m.area,
      material: typeof m.material === 'string' 
        ? { lv: m.material, en: m.material, ru: m.material }
        : m.material,
      thickness: m.thickness,
      finish: m.finish,
    })),
  }
}

// Convert plain text to Sanity block content
function convertTextToBlocks(text: string) {
  if (!text) return []
  
  const paragraphs = text.split('\n\n').filter(p => p.trim())
  
  return paragraphs.map((paragraph, index) => ({
    _type: 'block',
    _key: `block-${index}`,
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: `span-${index}`,
        text: paragraph.trim(),
        marks: [],
      },
    ],
    markDefs: [],
  }))
}

// Upload image to Sanity
async function uploadImage(imagePath: string, projectId: string): Promise<string | null> {
  try {
    // Read file from public directory
    const fs = await import('fs')
    const path = await import('path')
    
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`Warning: Image not found: ${fullPath}`)
      return null
    }
    
    const buffer = fs.readFileSync(fullPath)
    const filename = path.basename(imagePath)
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', buffer, {
      filename: `${projectId}-${filename}`,
    })
    
    console.log(`  Uploaded: ${filename} -> ${asset._id}`)
    return asset._id
  } catch (error) {
    console.error(`Error uploading image ${imagePath}:`, error)
    return null
  }
}

// Main migration function
async function migrateProjects() {
  console.log('========================================')
  console.log('LAGO Projects Migration to Sanity')
  console.log('========================================')
  console.log(`Found ${projects.length} projects to migrate\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const project of projects) {
    console.log(`Migrating: ${project.title.en}`)
    
    try {
      // Convert project data
      const sanityDoc = convertProjectToSanity(project)
      
      // Upload hero image if exists
      if (project.heroImage && !project.heroImage.startsWith('http')) {
        console.log(`  Uploading hero image...`)
        const heroAssetId = await uploadImage(project.heroImage, project.id)
        if (heroAssetId) {
          sanityDoc.heroImage = {
            _type: 'image',
            asset: { _type: 'reference', _ref: heroAssetId },
            alt: project.title,
          }
        }
      }
      
      // Upload gallery images
      if (project.gallery && project.gallery.length > 0) {
        console.log(`  Uploading ${project.gallery.length} gallery images...`)
        const galleryImages = []
        
        for (const img of project.gallery) {
          if (!img.src.startsWith('http')) {
            const assetId = await uploadImage(img.src, project.id)
            if (assetId) {
              galleryImages.push({
                _type: 'image',
                _key: Math.random().toString(36).substring(2, 11),
                asset: { _type: 'reference', _ref: assetId },
                alt: img.alt,
                materials: img.materials?.map(m => ({
                  _type: 'object',
                  _key: Math.random().toString(36).substring(2, 11),
                  area: m.area,
                  material: typeof m.material === 'string' ? m.material : m.material.en,
                  thickness: m.thickness ? (typeof m.thickness === 'string' ? m.thickness : m.thickness.en) : undefined,
                  finish: m.finish ? (typeof m.finish === 'string' ? m.finish : m.finish.en) : undefined,
                  notes: m.notes,
                })),
              })
            }
          }
        }
        
        sanityDoc.gallery = galleryImages
      }
      
      // Create or replace document in Sanity
      await client.createOrReplace(sanityDoc)
      console.log(`  ✓ Success\n`)
      successCount++
      
    } catch (error) {
      console.error(`  ✗ Error:`, error)
      errorCount++
    }
  }
  
  console.log('========================================')
  console.log('Migration Complete!')
  console.log('========================================')
  console.log(`Success: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log(`Total: ${projects.length}`)
}

// Run migration
migrateProjects().catch(error => {
  console.error('Migration failed:', error)
  process.exit(1)
})
