'use client'

import { Locale } from '@/lib/i18n/config'
import { ProjectStory, Project } from '@/content/types'

interface StorySectionProps {
  project: Project
  locale: Locale
}

export function StorySection({ project, locale }: StorySectionProps) {
  const story = project.story

  // If no story provided, use body text as fallback
  if (!story && !project.body) return null

  const labels = {
    lv: {
      goals: 'Klienta mērķi',
      challenges: 'Izaicinājumi',
      solution: 'Mūsu risinājums',
    },
    en: {
      goals: 'Client Goals',
      challenges: 'Challenges',
      solution: 'Our Solution',
    },
    ru: {
      goals: 'Цели клиента',
      challenges: 'Вызовы',
      solution: 'Наше решение',
    },
  }

  const t = labels[locale]

  return (
    <section className="py-24 bg-lago-black">
      <div className="container-lg">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Client Goals */}
          {story?.goals && (
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <h2 className="text-3xl md:text-4xl font-heading text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-12 bg-lago-gold rounded-full" />
                {t.goals}
              </h2>
              <div className="text-lago-light/80 text-lg leading-relaxed prose prose-invert max-w-none">
                <p className="whitespace-pre-line">{story.goals[locale]}</p>
              </div>
            </div>
          )}

          {/* Challenges */}
          {story?.challenges && (
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <h2 className="text-3xl md:text-4xl font-heading text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-12 bg-lago-gold rounded-full" />
                {t.challenges}
              </h2>
              <div className="text-lago-light/80 text-lg leading-relaxed prose prose-invert max-w-none">
                <p className="whitespace-pre-line">{story.challenges[locale]}</p>
              </div>
            </div>
          )}

          {/* Our Solution */}
          {story?.solution && (
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <h2 className="text-3xl md:text-4xl font-heading text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-12 bg-lago-gold rounded-full" />
                {t.solution}
              </h2>
              <div className="text-lago-light/80 text-lg leading-relaxed prose prose-invert max-w-none">
                <p className="whitespace-pre-line">{story.solution[locale]}</p>
              </div>
            </div>
          )}

          {/* Fallback: Use body text if no story sections */}
          {!story && project.body && (
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <div className="text-lago-light/80 text-lg leading-relaxed prose prose-invert max-w-none">
                <p className="whitespace-pre-line">{project.body[locale]}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

