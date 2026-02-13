// ============================================
// Site Settings Schema
// ============================================

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'storeName',
      title: 'Store Name',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
        { name: 'ru', title: 'Russian', type: 'string' },
      ],
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Featured Products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'homepageHero',
      title: 'Homepage Hero',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'string' },
          { name: 'en', title: 'EN', type: 'string' },
          { name: 'ru', title: 'RU', type: 'string' },
        ]},
        { name: 'subtitle', title: 'Subtitle', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'string' },
          { name: 'en', title: 'EN', type: 'string' },
          { name: 'ru', title: 'RU', type: 'string' },
        ]},
        { name: 'image', title: 'Background Image', type: 'image' },
        { name: 'ctaText', title: 'CTA Text', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'string' },
          { name: 'en', title: 'EN', type: 'string' },
          { name: 'ru', title: 'RU', type: 'string' },
        ]},
        { name: 'ctaLink', title: 'CTA Link', type: 'string' },
      ],
    }),
  ],
})
