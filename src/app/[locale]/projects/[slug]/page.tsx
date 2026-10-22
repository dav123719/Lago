import CatchAllPage from '../../[...slug]/page'
import { projects as localProjects } from '@/content/projects'
export const dynamic = 'force-dynamic'
// ============================================
// Project Detail Page with Sanity Integration
// ============================================

import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Locale, locales } from '@/lib/i18n/config'
import { getSanityClient, isSanityClientConfigured } from '@/lib/sanity/client'
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
  const { locale, slug } = await params
  const l = locales.includes(locale as Locale) ? locale as Locale : 'lv'
  const localProject = localProjects.find((item) => item.slug[l] === slug)
  let sanityProject: SanityProject | null = null
  if (!localProject && isSanityClientConfigured()) {
    try {
      sanityProject = await getSanityClient().fetch<SanityProject>(projectBySlugQuery, { slug })
    } catch {
      // Keep a useful fallback title when the content service is unavailable.
    }
  }
  const base = l === 'lv' ? 'projekti' : l === 'ru' ? 'proekty' : 'projects'
  const title = localProject?.title[l] || sanityProject?.title[l] || (l === 'lv' ? 'LAGO projekts' : l === 'ru' ? 'Проект LAGO' : 'LAGO project')
  const description = localProject?.summary[l] || sanityProject?.summary?.[l] || localProject?.subtitle?.[l] || sanityProject?.subtitle?.[l] || (l === 'lv' ? 'Akmens virsmas un mēbeles LAGO projektā Latvijā.' : l === 'ru' ? 'Каменные поверхности и мебель в проекте LAGO в Латвии.' : 'Stone surfaces and furniture in a LAGO project in Latvia.')
  const projectSlugs = localProject?.slug || (sanityProject ? {
    lv: sanityProject.slug.lv.current,
    en: sanityProject.slug.en.current,
    ru: sanityProject.slug.ru.current,
  } : undefined)

  return {
    title,
    description,
    alternates: {
      canonical: `/${l}/${base}/${slug}/`,
      languages: projectSlugs ? {
        lv: `/lv/projekti/${projectSlugs.lv}/`,
        en: `/en/projects/${projectSlugs.en}/`,
        ru: `/ru/proekty/${projectSlugs.ru}/`,
        'x-default': `/lv/projekti/${projectSlugs.lv}/`,
      } : undefined,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `https://lago.lv/${l}/${base}/${slug}/`,
      images: localProject?.heroImage ? [{ url: localProject.heroImage, alt: title }] : undefined,
    },
  }
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
    if (localProjects.some(p => p.slug[validLocale] === slug)) {
      const base = validLocale === 'lv' ? 'projekti' : validLocale === 'ru' ? 'proekty' : 'projects'
      return CatchAllPage({ params: Promise.resolve({ locale: validLocale, slug: [base, slug] }) })
    }
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
