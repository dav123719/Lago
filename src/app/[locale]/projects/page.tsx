// ============================================
// Projects Page with Sanity Integration
// ============================================
// AGENT slave-6 v1.0.1 - Data fetching fixed

import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Locale, locales } from '@/lib/i18n/config'
import { getSanityClient, isSanityClientConfigured, safeSanityFetch } from '@/lib/sanity/client'
import { projectsByLocaleQuery } from '@/lib/sanity/queries'
import { SanityProject } from '@/lib/sanity/types'
import { ProjectsPageClient } from './ProjectsPageClient'
import { createClient } from '@/lib/supabase/server'

interface ProjectsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await params
  const titles: Record<Locale, string> = {
    lv: 'Projekti | LAGO',
    en: 'Projects | LAGO',
    ru: 'Проекты | LAGO',
  }
  const descriptions: Record<Locale, string> = {
    lv: 'Apskatiet mūsu realizētos projektus - no privātām virtuvēm līdz komerciālajiem objektiem.',
    en: 'View our completed projects - from private kitchens to commercial spaces.',
    ru: 'Посмотрите наши реализованные проекты - от частных кухонь до коммерческих объектов.',
  }
  
  return {
    title: titles[locale as Locale],
    description: descriptions[locale as Locale],
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    return user.user_metadata?.role === 'admin' || 
           user.email?.endsWith('@lago.lv') || false
  } catch {
    return false
  }
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params
  
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const validLocale = locale as Locale
  
  // Check if in preview mode
  const draft = await draftMode()
  const isPreview = draft.isEnabled
  
  // Fetch projects from Sanity with graceful error handling
  let projects: SanityProject[] = []
  
  if (isSanityClientConfigured()) {
    try {
      const client = getSanityClient(isPreview)
      projects = await client.fetch(projectsByLocaleQuery)
    } catch (error) {
      console.error('Failed to fetch projects from Sanity:', error)
      // Return empty array, page will show appropriate message
      projects = []
    }
  } else {
    console.warn('Sanity not configured, projects will not be fetched')
  }

  // Check if user is admin for edit functionality
  let isAdmin = false
  try {
    isAdmin = await checkIsAdmin()
  } catch (error) {
    console.error('Error checking admin status:', error)
    isAdmin = false
  }

  // Determine base path for projects
  const projectsBasePath = `/${validLocale}/${
    validLocale === 'lv' ? 'projekti' : 
    validLocale === 'ru' ? 'proekty' : 
    'projects'
  }`

  return (
    <ProjectsPageClient
      projects={projects}
      locale={validLocale}
      isAdmin={isAdmin}
      projectsBasePath={projectsBasePath}
    />
  )
}
