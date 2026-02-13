// ============================================
// Project Detail Page with Sanity Integration
// ============================================

import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Locale, locales } from '@/lib/i18n/config'
import { getSanityClient } from '@/lib/sanity/client'
import { projectBySlugQuery, allProjectSlugsQuery } from '@/lib/sanity/queries'
import { SanityProject } from '@/lib/sanity/types'
import { ProjectDetailContent } from './ProjectDetailContent'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ProjectDetailPageProps {
  params: Promise<{ locale: string; slug: string }>
}

// AGENT slave-1 v1.0.1 - Dynamic routes fixed

// Generate static paths for all projects
export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  
  try {
    // Fetch all project slugs from Sanity
    const client = getSanityClient(false)
    const projects = await client.fetch<{ slug: { lv?: { current?: string }; en?: { current?: string }; ru?: { current?: string } } }[]>(allProjectSlugsQuery)
    
    if (projects && projects.length > 0) {
      // Extract all unique slugs across locales
      const allSlugs = new Set<string>()
      
      for (const project of projects) {
        if (project.slug?.lv?.current) allSlugs.add(project.slug.lv.current)
        if (project.slug?.en?.current) allSlugs.add(project.slug.en.current)
        if (project.slug?.ru?.current) allSlugs.add(project.slug.ru.current)
      }
      
      // Generate params for all locale/slug combinations
      for (const locale of locales) {
        for (const slug of allSlugs) {
          params.push({ locale, slug })
        }
      }
    }
  } catch (error) {
    // Sanity not configured or fetch failed - return empty array
    // Project pages will 404 at runtime if Sanity is not available
    console.warn('Sanity not available, project pages will be generated on-demand')
  }
  
  return params
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { locale } = await params
  const titles = {
    lv: 'Projekti | LAGO',
    en: 'Projects | LAGO',
    ru: 'Проекты | LAGO',
  }
  return { title: titles[locale as Locale] || titles.en }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, slug } = await params
  
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const validLocale = locale as Locale
  
  // Check if in preview mode
  const draft = await draftMode()
  const isPreview = draft.isEnabled
  
  // Fetch project from Sanity
  let project: SanityProject | null = null
  try {
    const client = getSanityClient(isPreview)
    project = await client.fetch<SanityProject>(projectBySlugQuery, { slug })
  } catch {
    // Sanity not configured or fetch failed
  }

  if (!project) {
    notFound()
  }

  // Determine projects base path
  const projectsBasePath = `/${validLocale}/${
    validLocale === 'lv' ? 'projekti' : 
    validLocale === 'ru' ? 'proekty' : 
    'projects'
  }`

  return (
    <>
      <ProjectDetailContent 
        project={project} 
        locale={validLocale}
      />
      
      {/* Back link */}
      <section className="py-12 bg-lago-dark border-t border-white/5">
        <div className="container-lg">
          <Link
            href={projectsBasePath}
            className="group inline-flex items-center gap-2 text-lago-gold hover:text-lago-gold-light transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180 transform group-hover:-translate-x-2 transition-transform" />
            {validLocale === 'lv' ? 'Atpakaļ uz projektiem' : 
             validLocale === 'en' ? 'Back to projects' : 
             'Назад к проектам'}
          </Link>
        </div>
      </section>
    </>
  )
}
