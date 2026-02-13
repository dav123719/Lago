// ============================================
// Product Schema
// ============================================

import { defineType, defineField, defineArrayMember } from 'sanity'

export default defineType({
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
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required(),
      group: 'basic',
    }),
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'object',
      fields: [
        { name: 'lv', title: 'Latvian', type: 'string', validation: (Rule) => Rule.required() },
        { name: 'en', title: 'English', type: 'string', validation: (Rule) => Rule.required() },
        { name: 'ru', title: 'Russian', type: 'string', validation: (Rule) => Rule.required() },
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
      validation: (Rule) => Rule.required().min(0),
      group: 'pricing',
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale Price (EUR)',
      type: 'number',
      description: 'Leave empty for no sale',
      validation: (Rule) => Rule.min(0),
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
