import type { MetadataRoute } from 'next'
import { locales, type Locale } from '@/lib/i18n/config'
import { materials } from '@/content/materials'
import { furnitureTypes } from '@/content/furniture'
import { projects as localProjects } from '@/content/projects'
import { getSanityClient, isSanityClientConfigured } from '@/lib/sanity/client'
import { allProjectSlugsQuery } from '@/lib/sanity/queries'

const SITE_URL = 'https://lago.lv'
type LocalizedPath = Record<Locale, string>

const stoneBase = (locale: Locale) => locale === 'lv' ? 'akmens-virsmas' : locale === 'ru' ? 'kamennye-poverhnosti' : 'stone-surfaces'
const furnitureBase = (locale: Locale) => locale === 'lv' ? 'mebeles' : locale === 'ru' ? 'mebel' : 'furniture'
const projectsBase = (locale: Locale) => locale === 'lv' ? 'projekti' : locale === 'ru' ? 'proekty' : 'projects'
const aboutBase = (locale: Locale) => locale === 'lv' ? 'par-mums' : locale === 'ru' ? 'o-nas' : 'about-us'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const groups: LocalizedPath[] = [
    { lv: '/lv/', en: '/en/', ru: '/ru/' },
    { lv: '/lv/store/', en: '/en/store/', ru: '/ru/store/' },
    { lv: `/lv/${stoneBase('lv')}/`, en: `/en/${stoneBase('en')}/`, ru: `/ru/${stoneBase('ru')}/` },
    { lv: `/lv/${furnitureBase('lv')}/`, en: `/en/${furnitureBase('en')}/`, ru: `/ru/${furnitureBase('ru')}/` },
    { lv: `/lv/${projectsBase('lv')}/`, en: `/en/${projectsBase('en')}/`, ru: `/ru/${projectsBase('ru')}/` },
    { lv: `/lv/${aboutBase('lv')}/`, en: `/en/${aboutBase('en')}/`, ru: `/ru/${aboutBase('ru')}/` },
  ]

  for (const material of materials) {
    groups.push(Object.fromEntries(locales.map((locale) => [
      locale,
      `/${locale}/${stoneBase(locale)}/${material.slug[locale]}/`,
    ])) as LocalizedPath)
  }

  for (const furniture of furnitureTypes) {
    groups.push(Object.fromEntries(locales.map((locale) => [
      locale,
      `/${locale}/${furnitureBase(locale)}/${furniture.slug[locale]}/`,
    ])) as LocalizedPath)
  }

  for (const project of localProjects) {
    groups.push(Object.fromEntries(locales.map((locale) => [
      locale,
      `/${locale}/${projectsBase(locale)}/${project.slug[locale]}/`,
    ])) as LocalizedPath)
  }

  if (isSanityClientConfigured()) {
    try {
      const remoteProjects = await getSanityClient().fetch<Array<{ slug?: Partial<Record<Locale, { current?: string }>> }>>(allProjectSlugsQuery)
      for (const project of remoteProjects) {
        const slugs = Object.fromEntries(locales.map((locale) => [locale, project.slug?.[locale]?.current])) as Partial<Record<Locale, string>>
        if (locales.some((locale) => !slugs[locale])) continue
        if (localProjects.some((local) => locales.every((locale) => local.slug[locale] === slugs[locale]))) continue
        groups.push(Object.fromEntries(locales.map((locale) => [
          locale,
          `/${locale}/${projectsBase(locale)}/${slugs[locale]}/`,
        ])) as LocalizedPath)
      }
    } catch {
      // Keep the known, code-backed public routes in the sitemap if Sanity is unavailable.
    }
  }

  return groups.flatMap((paths) => locales.map((locale) => ({
    url: `${SITE_URL}${paths[locale]}`,
    alternates: { languages: Object.fromEntries(locales.map((language) => [language, `${SITE_URL}${paths[language]}`])) },
  })))
}
