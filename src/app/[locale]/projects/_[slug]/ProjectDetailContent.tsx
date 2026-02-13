// ============================================
// Project Detail Content Component
// ============================================
// Renders project details from Sanity data

'use client'

import { Locale } from '@/lib/i18n/config'
import { SanityProject, convertSanityProject } from '@/lib/sanity'
import { ProjectDetailHero } from '@/components/pages/project-detail/ProjectDetailHero'
import { QuickFacts } from '@/components/pages/project-detail/QuickFacts'
import { StorySection } from '@/components/pages/project-detail/StorySection'
import { ProjectGallery } from '@/components/pages/project-detail/ProjectGallery'

interface ProjectDetailContentProps {
  project: SanityProject
  locale: Locale
}

export function ProjectDetailContent({ project, locale }: ProjectDetailContentProps) {
  // Convert Sanity project to app Project format
  const convertedProject = convertSanityProject(project, locale)

  return (
    <>
      {/* Hero Section */}
      <ProjectDetailHero project={convertedProject} locale={locale} />

      {/* Quick Facts & Materials */}
      <QuickFacts project={convertedProject} locale={locale} />

      {/* Story Section */}
      <StorySection project={convertedProject} locale={locale} />

      {/* Gallery */}
      <ProjectGallery project={convertedProject} locale={locale} />
    </>
  )
}
