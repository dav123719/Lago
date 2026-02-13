// ============================================
// Project Schema for Sanity
// ============================================
// Full project schema with multilingual support

import { defineType, defineField, defineArrayMember } from 'sanity'
import { Presentation } from 'lucide-react'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: Presentation,
  groups: [
    { name: 'basic', title: 'Basic Info' },
    { name: 'content', title: 'Content' },
    { name: 'gallery', title: 'Gallery' },
    { name: 'details', title: 'Project Details' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ============================================
    // BASIC INFO GROUP
    // ============================================
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'object',
      group: 'basic',
      description: 'URL-friendly identifiers for each language',
      fields: [
        defineField({
          name: 'lv',
          title: 'Latvian',
          type: 'slug',
          options: { source: 'title.lv', maxLength: 100 },
          validation: Rule => Rule.required(),
        }),
        defineField({
          name: 'en',
          title: 'English',
          type: 'slug',
          options: { source: 'title.en', maxLength: 100 },
          validation: Rule => Rule.required(),
        }),
        defineField({
          name: 'ru',
          title: 'Russian',
          type: 'slug',
          options: { source: 'title.ru', maxLength: 100 },
          validation: Rule => Rule.required(),
        }),
      ],
    }),

    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'object',
      group: 'basic',
      fields: [
        defineField({ name: 'lv', title: 'Latvian', type: 'string', validation: Rule => Rule.required() }),
        defineField({ name: 'en', title: 'English', type: 'string', validation: Rule => Rule.required() }),
        defineField({ name: 'ru', title: 'Russian', type: 'string', validation: Rule => Rule.required() }),
      ],
    }),

    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'object',
      group: 'basic',
      description: 'Short one-liner under the title',
      fields: [
        defineField({ name: 'lv', title: 'Latvian', type: 'string' }),
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'ru', title: 'Russian', type: 'string' }),
      ],
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          { title: 'Stone Surfaces', value: 'stone' },
          { title: 'Furniture', value: 'furniture' },
        ],
        layout: 'radio',
      },
      initialValue: 'stone',
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'material',
      title: 'Primary Material',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          { title: 'Silestone', value: 'silestone' },
          { title: 'Dekton', value: 'dekton' },
          { title: 'Granite', value: 'granite' },
          { title: 'Marble', value: 'marble' },
          { title: 'Other', value: 'other' },
        ],
      },
      hidden: ({ document }) => document?.category !== 'stone',
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'basic',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Kitchen', value: 'kitchen' },
          { title: 'Bathroom', value: 'bathroom' },
          { title: 'Living Room', value: 'living-room' },
          { title: 'Outdoor', value: 'outdoor' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Residential', value: 'residential' },
        ],
        layout: 'tags',
      },
    }),

    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      group: 'basic',
      initialValue: false,
      description: 'Show this project in featured sections',
    }),

    defineField({
      name: 'year',
      title: 'Year Completed',
      type: 'number',
      group: 'basic',
      validation: Rule => Rule.min(2000).max(new Date().getFullYear()),
    }),

    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      group: 'basic',
      fields: [
        defineField({ name: 'lv', title: 'Latvian', type: 'string' }),
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'ru', title: 'Russian', type: 'string' }),
      ],
    }),

    // ============================================
    // CONTENT GROUP
    // ============================================
    defineField({
      name: 'summary',
      title: 'Summary (Short)',
      type: 'object',
      group: 'content',
      description: 'Brief description for listings and cards',
      fields: [
        defineField({ name: 'lv', title: 'Latvian', type: 'text', rows: 2 }),
        defineField({ name: 'en', title: 'English', type: 'text', rows: 2 }),
        defineField({ name: 'ru', title: 'Russian', type: 'text', rows: 2 }),
      ],
    }),

    defineField({
      name: 'body',
      title: 'Full Description',
      type: 'object',
      group: 'content',
      description: 'Detailed project description with rich text',
      fields: [
        defineField({
          name: 'lv',
          title: 'Latvian',
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({ 
              type: 'image', 
              options: { hotspot: true },
              fields: [
                defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
                defineField({ name: 'caption', title: 'Caption', type: 'string' }),
              ],
            }),
          ],
        }),
        defineField({
          name: 'en',
          title: 'English',
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({ 
              type: 'image', 
              options: { hotspot: true },
              fields: [
                defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
                defineField({ name: 'caption', title: 'Caption', type: 'string' }),
              ],
            }),
          ],
        }),
        defineField({
          name: 'ru',
          title: 'Russian',
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({ 
              type: 'image', 
              options: { hotspot: true },
              fields: [
                defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
                defineField({ name: 'caption', title: 'Caption', type: 'string' }),
              ],
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'object',
          fields: [
            defineField({ name: 'lv', title: 'Latvian', type: 'string' }),
            defineField({ name: 'en', title: 'English', type: 'string' }),
            defineField({ name: 'ru', title: 'Russian', type: 'string' }),
          ],
        }),
      ],
    }),

    // ============================================
    // GALLERY GROUP
    // ============================================
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'gallery',
      description: 'Project gallery with material annotations',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'object',
              fields: [
                defineField({ name: 'lv', title: 'Latvian', type: 'string' }),
                defineField({ name: 'en', title: 'English', type: 'string' }),
                defineField({ name: 'ru', title: 'Russian', type: 'string' }),
              ],
            }),
            defineField({
              name: 'materials',
              title: 'Materials in Image',
              type: 'array',
              description: 'Annotate materials visible in this image',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'area',
                      title: 'Area',
                      type: 'object',
                      fields: [
                        defineField({ name: 'lv', title: 'LV', type: 'string' }),
                        defineField({ name: 'en', title: 'EN', type: 'string' }),
                        defineField({ name: 'ru', title: 'RU', type: 'string' }),
                      ],
                    }),
                    defineField({
                      name: 'material',
                      title: 'Material Name',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Silestone Eternal Calacatta Gold', value: 'Silestone Eternal Calacatta Gold' },
                          { title: 'Silestone Blanco Zeus', value: 'Silestone Blanco Zeus' },
                          { title: 'Dekton Bergen', value: 'Dekton Bergen' },
                          { title: 'Dekton Kelya', value: 'Dekton Kelya' },
                          { title: 'Dekton Laurent', value: 'Dekton Laurent' },
                          { title: 'Nero Marquina Marble', value: 'Nero Marquina Marble' },
                          { title: 'Carrara White Marble', value: 'Carrara White Marble' },
                          { title: 'Calacatta Marble', value: 'Calacatta Marble' },
                          { title: 'Custom Stone Sink', value: 'Custom Stone Sink' },
                        ],
                      },
                    }),
                    defineField({ name: 'thickness', title: 'Thickness (e.g., "20 mm")', type: 'string' }),
                    defineField({ name: 'finish', title: 'Finish (e.g., "Polished")', type: 'string' }),
                    defineField({
                      name: 'notes',
                      title: 'Notes',
                      type: 'object',
                      fields: [
                        defineField({ name: 'lv', title: 'LV', type: 'text', rows: 2 }),
                        defineField({ name: 'en', title: 'EN', type: 'text', rows: 2 }),
                        defineField({ name: 'ru', title: 'RU', type: 'text', rows: 2 }),
                      ],
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'material',
                      subtitle: 'area.en',
                    },
                  },
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    // ============================================
    // DETAILS GROUP
    // ============================================
    defineField({
      name: 'quickFacts',
      title: 'Quick Facts',
      type: 'object',
      group: 'details',
      fields: [
        defineField({
          name: 'area',
          title: 'Area (e.g., "8 m²")',
          type: 'object',
          fields: [
            defineField({ name: 'lv', title: 'LV', type: 'string' }),
            defineField({ name: 'en', title: 'EN', type: 'string' }),
            defineField({ name: 'ru', title: 'RU', type: 'string' }),
          ],
        }),
        defineField({
          name: 'type',
          title: 'Project Type',
          type: 'object',
          fields: [
            defineField({ name: 'lv', title: 'LV', type: 'string' }),
            defineField({ name: 'en', title: 'EN', type: 'string' }),
            defineField({ name: 'ru', title: 'RU', type: 'string' }),
          ],
        }),
        defineField({
          name: 'materials',
          title: 'Materials Used',
          type: 'object',
          fields: [
            defineField({ name: 'lv', title: 'LV', type: 'string' }),
            defineField({ name: 'en', title: 'EN', type: 'string' }),
            defineField({ name: 'ru', title: 'RU', type: 'string' }),
          ],
        }),
        defineField({
          name: 'scope',
          title: 'Scope of Work',
          type: 'object',
          fields: [
            defineField({ name: 'lv', title: 'LV', type: 'string' }),
            defineField({ name: 'en', title: 'EN', type: 'string' }),
            defineField({ name: 'ru', title: 'RU', type: 'string' }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'story',
      title: 'Project Story',
      type: 'object',
      group: 'details',
      description: 'Client goals, challenges, and solution',
      fields: [
        defineField({
          name: 'goals',
          title: 'Client Goals',
          type: 'object',
          fields: [
            defineField({ name: 'lv', title: 'LV', type: 'array', of: [{ type: 'block' }] }),
            defineField({ name: 'en', title: 'EN', type: 'array', of: [{ type: 'block' }] }),
            defineField({ name: 'ru', title: 'RU', type: 'array', of: [{ type: 'block' }] }),
          ],
        }),
        defineField({
          name: 'challenges',
          title: 'Challenges',
          type: 'object',
          fields: [
            defineField({ name: 'lv', title: 'LV', type: 'array', of: [{ type: 'block' }] }),
            defineField({ name: 'en', title: 'EN', type: 'array', of: [{ type: 'block' }] }),
            defineField({ name: 'ru', title: 'RU', type: 'array', of: [{ type: 'block' }] }),
          ],
        }),
        defineField({
          name: 'solution',
          title: 'Our Solution',
          type: 'object',
          fields: [
            defineField({ name: 'lv', title: 'LV', type: 'array', of: [{ type: 'block' }] }),
            defineField({ name: 'en', title: 'EN', type: 'array', of: [{ type: 'block' }] }),
            defineField({ name: 'ru', title: 'RU', type: 'array', of: [{ type: 'block' }] }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'materialsList',
      title: 'Materials List',
      type: 'array',
      group: 'details',
      description: 'Detailed materials list for the project',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'area',
              title: 'Area',
              type: 'object',
              fields: [
                defineField({ name: 'lv', title: 'LV', type: 'string' }),
                defineField({ name: 'en', title: 'EN', type: 'string' }),
                defineField({ name: 'ru', title: 'RU', type: 'string' }),
              ],
            }),
            defineField({
              name: 'material',
              title: 'Material',
              type: 'object',
              fields: [
                defineField({ name: 'lv', title: 'LV', type: 'string' }),
                defineField({ name: 'en', title: 'EN', type: 'string' }),
                defineField({ name: 'ru', title: 'RU', type: 'string' }),
              ],
            }),
            defineField({
              name: 'thickness',
              title: 'Thickness',
              type: 'object',
              fields: [
                defineField({ name: 'lv', title: 'LV', type: 'string' }),
                defineField({ name: 'en', title: 'EN', type: 'string' }),
                defineField({ name: 'ru', title: 'RU', type: 'string' }),
              ],
            }),
            defineField({
              name: 'finish',
              title: 'Finish',
              type: 'object',
              fields: [
                defineField({ name: 'lv', title: 'LV', type: 'string' }),
                defineField({ name: 'en', title: 'EN', type: 'string' }),
                defineField({ name: 'ru', title: 'RU', type: 'string' }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'area.en',
              subtitle: 'material.en',
            },
          },
        }),
      ],
    }),

    // ============================================
    // SEO GROUP
    // ============================================
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({ name: 'lv', title: 'Latvian', type: 'string' }),
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'ru', title: 'Russian', type: 'string' }),
      ],
    }),

    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({ name: 'lv', title: 'Latvian', type: 'text', rows: 2 }),
        defineField({ name: 'en', title: 'English', type: 'text', rows: 2 }),
        defineField({ name: 'ru', title: 'Russian', type: 'text', rows: 2 }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title.en',
      subtitle: 'category',
      media: 'heroImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Untitled Project',
        subtitle: subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : '',
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Year Completed, New First',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
    {
      title: 'Year Completed, Old First',
      name: 'yearAsc',
      by: [{ field: 'year', direction: 'asc' }],
    },
    {
      title: 'Last Updated',
      name: 'updatedAt',
      by: [{ field: '_updatedAt', direction: 'desc' }],
    },
  ],
})
