// ============================================
// LAGO Sanity.io Schema
// ============================================
// Place in sanity/schemas/ directory

import { defineType, defineField, defineArrayMember } from 'sanity'

// ============================================
// CATEGORY SCHEMA
// ============================================
export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name.en',
        maxLength: 100,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'string', validation: Rule => Rule.required() },
        { name: 'en', title: 'English', type: 'string', validation: Rule => Rule.required() },
        { name: 'ru', title: 'Russian', type: 'string', validation: Rule => Rule.required() },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'text', rows: 3 },
        { name: 'en', title: 'English', type: 'text', rows: 3 },
        { name: 'ru', title: 'Russian', type: 'text', rows: 3 },
      ],
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'image',
      title: 'Category Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showInNavigation',
      title: 'Show in Navigation',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name.en',
      media: 'image',
    },
  },
})

// ============================================
// PRODUCT SCHEMA
// ============================================
export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info' },
    { name: 'pricing', title: 'Pricing & Inventory' },
    { name: 'content', title: 'Content' },
    { name: 'seo', title: 'SEO' },
    { name: 'sync', title: 'Sync Status' },
  ],
  fields: [
    // Basic Info
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      validation: Rule => Rule.required(),
      group: 'basic',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name.en',
        maxLength: 200,
      },
      validation: Rule => Rule.required(),
      group: 'basic',
    }),
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'string', validation: Rule => Rule.required() },
        { name: 'en', title: 'English', type: 'string', validation: Rule => Rule.required() },
        { name: 'ru', title: 'Russian', type: 'string', validation: Rule => Rule.required() },
      ],
      group: 'basic',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'basic',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Draft', value: 'draft' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'draft',
      group: 'basic',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
      group: 'basic',
    }),

    // Pricing & Inventory
    defineField({
      name: 'basePrice',
      title: 'Base Price (EUR)',
      type: 'number',
      validation: Rule => Rule.required().min(0),
      group: 'pricing',
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale Price (EUR)',
      type: 'number',
      description: 'Leave empty for no sale',
      validation: Rule => Rule.min(0),
      group: 'pricing',
    }),
    defineField({
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      initialValue: 0,
      group: 'pricing',
    }),
    defineField({
      name: 'lowStockThreshold',
      title: 'Low Stock Alert Threshold',
      type: 'number',
      initialValue: 5,
      group: 'pricing',
    }),
    defineField({
      name: 'weight',
      title: 'Weight (kg)',
      type: 'number',
      group: 'pricing',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions (cm)',
      type: 'object',
      fields: [
        { name: 'length', title: 'Length', type: 'number' },
        { name: 'width', title: 'Width', type: 'number' },
        { name: 'height', title: 'Height', type: 'number' },
      ],
      group: 'pricing',
    }),

    // Content
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'text', rows: 2 },
        { name: 'en', title: 'English', type: 'text', rows: 2 },
        { name: 'ru', title: 'Russian', type: 'text', rows: 2 },
      ],
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'object',
      fields: [
        { 
          name: 'lv', 
          title: 'Latvian', 
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({ type: 'image', options: { hotspot: true } }),
          ],
        },
        { 
          name: 'en', 
          title: 'English', 
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({ type: 'image', options: { hotspot: true } }),
          ],
        },
        { 
          name: 'ru', 
          title: 'Russian', 
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({ type: 'image', options: { hotspot: true } }),
          ],
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      options: {
        list: [
          { title: 'Silestone', value: 'silestone' },
          { title: 'Dekton', value: 'dekton' },
          { title: 'Granite', value: 'granite' },
          { title: 'Marble', value: 'marble' },
          { title: 'Other', value: 'other' },
        ],
      },
      group: 'content',
    }),
    defineField({
      name: 'finish',
      title: 'Finish',
      type: 'string',
      options: {
        list: [
          { title: 'Polished', value: 'polished' },
          { title: 'Matte', value: 'matte' },
          { title: 'Honed', value: 'honed' },
          { title: 'Leather', value: 'leather' },
        ],
      },
      group: 'content',
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alt Text', type: 'object', fields: [
              { name: 'lv', title: 'Latvian', type: 'string' },
              { name: 'en', title: 'English', type: 'string' },
              { name: 'ru', title: 'Russian', type: 'string' },
            ]},
            { name: 'caption', title: 'Caption', type: 'object', fields: [
              { name: 'lv', title: 'Latvian', type: 'string' },
              { name: 'en', title: 'English', type: 'string' },
              { name: 'ru', title: 'Russian', type: 'string' },
            ]},
          ],
        }),
      ],
      group: 'content',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      group: 'content',
    }),

    // SEO
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
        { name: 'ru', title: 'Russian', type: 'string' },
      ],
      group: 'seo',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'text', rows: 2 },
        { name: 'en', title: 'English', type: 'text', rows: 2 },
        { name: 'ru', title: 'Russian', type: 'text', rows: 2 },
      ],
      group: 'seo',
    }),

    // Sync Status (read-only, managed by webhook)
    defineField({
      name: 'lastSyncedAt',
      title: 'Last Synced to Store',
      type: 'datetime',
      readOnly: true,
      group: 'sync',
    }),
    defineField({
      name: 'syncStatus',
      title: 'Sync Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Synced', value: 'synced' },
          { title: 'Error', value: 'error' },
        ],
      },
      readOnly: true,
      group: 'sync',
    }),
  ],
  preview: {
    select: {
      title: 'name.en',
      subtitle: 'sku',
      media: 'images.0',
    },
  },
})

// ============================================
// PROJECT SCHEMA (Enhanced)
// ============================================
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info' },
    { name: 'content', title: 'Content' },
    { name: 'gallery', title: 'Gallery' },
    { name: 'details', title: 'Project Details' },
  ],
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'slug', options: { source: 'title.lv' } },
        { name: 'en', title: 'English', type: 'slug', options: { source: 'title.en' } },
        { name: 'ru', title: 'Russian', type: 'slug', options: { source: 'title.ru' } },
      ],
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'string', validation: Rule => Rule.required() },
        { name: 'en', title: 'English', type: 'string', validation: Rule => Rule.required() },
        { name: 'ru', title: 'Russian', type: 'string', validation: Rule => Rule.required() },
      ],
      group: 'basic',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
        { name: 'ru', title: 'Russian', type: 'string' },
      ],
      group: 'basic',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Stone', value: 'stone' },
          { title: 'Furniture', value: 'furniture' },
        ],
      },
      group: 'basic',
    }),
    defineField({
      name: 'material',
      title: 'Primary Material',
      type: 'string',
      options: {
        list: [
          { title: 'Silestone', value: 'silestone' },
          { title: 'Dekton', value: 'dekton' },
          { title: 'Granite', value: 'granite' },
          { title: 'Marble', value: 'marble' },
          { title: 'Other', value: 'other' },
        ],
      },
      group: 'basic',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
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
      },
      group: 'basic',
    }),
    defineField({
      name: 'year',
      title: 'Year Completed',
      type: 'number',
      group: 'basic',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
        { name: 'ru', title: 'Russian', type: 'string' },
      ],
      group: 'basic',
    }),

    // Content
    defineField({
      name: 'summary',
      title: 'Summary (Short)',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'text', rows: 2 },
        { name: 'en', title: 'English', type: 'text', rows: 2 },
        { name: 'ru', title: 'Russian', type: 'text', rows: 2 },
      ],
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Full Description',
      type: 'object',
      fields: [
        { 
          name: 'lv', 
          title: 'Latvian', 
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({ type: 'image', options: { hotspot: true } }),
          ],
        },
        { 
          name: 'en', 
          title: 'English', 
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({ type: 'image', options: { hotspot: true } }),
          ],
        },
        { 
          name: 'ru', 
          title: 'Russian', 
          type: 'array',
          of: [
            defineArrayMember({ type: 'block' }),
            defineArrayMember({ type: 'image', options: { hotspot: true } }),
          ],
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      group: 'content',
    }),

    // Gallery with material annotations
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
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
                { name: 'lv', title: 'Latvian', type: 'string' },
                { name: 'en', title: 'English', type: 'string' },
                { name: 'ru', title: 'Russian', type: 'string' },
              ],
            }),
            defineField({
              name: 'materials',
              title: 'Materials in Image',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    { name: 'area', title: 'Area', type: 'object', fields: [
                      { name: 'lv', title: 'LV', type: 'string' },
                      { name: 'en', title: 'EN', type: 'string' },
                      { name: 'ru', title: 'RU', type: 'string' },
                    ]},
                    { name: 'material', title: 'Material', type: 'string' },
                    { name: 'thickness', title: 'Thickness', type: 'string' },
                    { name: 'finish', title: 'Finish', type: 'string' },
                    { name: 'notes', title: 'Notes', type: 'object', fields: [
                      { name: 'lv', title: 'LV', type: 'text', rows: 2 },
                      { name: 'en', title: 'EN', type: 'text', rows: 2 },
                      { name: 'ru', title: 'RU', type: 'text', rows: 2 },
                    ]},
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
      group: 'gallery',
    }),

    // Project Details
    defineField({
      name: 'quickFacts',
      title: 'Quick Facts',
      type: 'object',
      fields: [
        { name: 'area', title: 'Area (e.g., "8 m²")', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'string' },
          { name: 'en', title: 'EN', type: 'string' },
          { name: 'ru', title: 'RU', type: 'string' },
        ]},
        { name: 'type', title: 'Project Type', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'string' },
          { name: 'en', title: 'EN', type: 'string' },
          { name: 'ru', title: 'RU', type: 'string' },
        ]},
        { name: 'materials', title: 'Materials Used', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'string' },
          { name: 'en', title: 'EN', type: 'string' },
          { name: 'ru', title: 'RU', type: 'string' },
        ]},
        { name: 'scope', title: 'Scope of Work', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'string' },
          { name: 'en', title: 'EN', type: 'string' },
          { name: 'ru', title: 'RU', type: 'string' },
        ]},
      ],
      group: 'details',
    }),
    defineField({
      name: 'story',
      title: 'Project Story',
      type: 'object',
      fields: [
        { name: 'goals', title: 'Client Goals', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'array', of: [{ type: 'block' }] },
          { name: 'en', title: 'EN', type: 'array', of: [{ type: 'block' }] },
          { name: 'ru', title: 'RU', type: 'array', of: [{ type: 'block' }] },
        ]},
        { name: 'challenges', title: 'Challenges', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'array', of: [{ type: 'block' }] },
          { name: 'en', title: 'EN', type: 'array', of: [{ type: 'block' }] },
          { name: 'ru', title: 'RU', type: 'array', of: [{ type: 'block' }] },
        ]},
        { name: 'solution', title: 'Our Solution', type: 'object', fields: [
          { name: 'lv', title: 'LV', type: 'array', of: [{ type: 'block' }] },
          { name: 'en', title: 'EN', type: 'array', of: [{ type: 'block' }] },
          { name: 'ru', title: 'RU', type: 'array', of: [{ type: 'block' }] },
        ]},
      ],
      group: 'details',
    }),
    defineField({
      name: 'materialsList',
      title: 'Materials List',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'area', title: 'Area', type: 'object', fields: [
              { name: 'lv', title: 'LV', type: 'string' },
              { name: 'en', title: 'EN', type: 'string' },
              { name: 'ru', title: 'RU', type: 'string' },
            ]},
            { name: 'material', title: 'Material', type: 'object', fields: [
              { name: 'lv', title: 'LV', type: 'string' },
              { name: 'en', title: 'EN', type: 'string' },
              { name: 'ru', title: 'RU', type: 'string' },
            ]},
            { name: 'thickness', title: 'Thickness', type: 'object', fields: [
              { name: 'lv', title: 'LV', type: 'string' },
              { name: 'en', title: 'EN', type: 'string' },
              { name: 'ru', title: 'RU', type: 'string' },
            ]},
            { name: 'finish', title: 'Finish', type: 'object', fields: [
              { name: 'lv', title: 'LV', type: 'string' },
              { name: 'en', title: 'EN', type: 'string' },
              { name: 'ru', title: 'RU', type: 'string' },
            ]},
          ],
        }),
      ],
      group: 'details',
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      subtitle: 'category',
      media: 'heroImage',
    },
  },
})

// ============================================
// SITE SETTINGS
// ============================================
export const siteSettings = defineType({
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
      validation: Rule => Rule.max(8),
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

// Export all schemas
export const schemaTypes = [category, product, project, siteSettings]
