# LAGO Sanity CMS Integration

This document describes the Sanity CMS integration for the LAGO luxury furniture website.

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Sanity credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Usually "production"
- `SANITY_API_READ_TOKEN` - For preview mode (read-only)
- `SANITY_API_WRITE_TOKEN` - For inline editing (write access)
- `SANITY_PREVIEW_SECRET` - Secret for preview mode

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

## Architecture

### Project Structure

```
sanity/                     # Sanity configuration
├── schemas/
│   ├── project.ts         # Project schema
│   └── index.ts           # Schema exports
└── sanity.config.ts       # Studio configuration

src/
├── app/
│   ├── studio/            # Embedded Sanity Studio
│   │   └── [[...tool]]/
│   ├── api/
│   │   ├── preview/       # Preview mode API
│   │   └── projects/      # Project API routes
│   └── [locale]/
│       └── projects/
│           ├── page.tsx           # Projects listing
│           └── [slug]/
│               └── page.tsx       # Project detail
├── components/
│   ├── sanity/            # Sanity components
│   │   ├── SanityImage.tsx
│   │   └── PreviewProvider.tsx
│   └── projects/          # Project components
│       ├── ProjectCardEditable.tsx
│       └── EditProjectModal.tsx
├── lib/
│   └── sanity/            # Sanity utilities
│       ├── types.ts
│       ├── client.ts
│       ├── config.ts
│       └── queries.ts
└── hooks/
    └── useAdmin.ts        # Admin status hook
```

## Features

### 1. Embedded Sanity Studio

Access the studio at `/studio` (admin only). The studio is embedded in the Next.js app and provides full content management.

### 2. Inline Editing

Admin users can edit projects directly from the projects listing page:
- Hover over a project card to reveal the edit button
- Click to open the inline edit modal
- Make changes and save

### 3. Preview Mode

View draft content before publishing:
- Enable preview: `/api/preview?token=YOUR_SECRET&slug=project-slug`
- Disable preview: `/api/preview` (DELETE request)

### 4. Image Optimization

Sanity images are automatically optimized:
- WebP/AVIF format conversion
- Responsive srcset generation
- Lazy loading
- Blur placeholder (LQIP)

## Schema

### Project

The main content type for showcasing completed work:

- **Basic Info**: Title (3 languages), subtitle, category, material, tags, year, location
- **Content**: Summary, body (rich text), hero image
- **Gallery**: Multiple images with material annotations
- **Details**: Quick facts, project story (goals/challenges/solution), materials list
- **SEO**: Meta title and description

## API Routes

### `/api/preview`

Enable/disable preview mode for viewing drafts.

### `/api/projects/update`

Update projects from the inline editing modal (admin only).

## Migration

To migrate existing projects from `src/content/projects.ts` to Sanity:

```bash
# Set environment variables first
export NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
export SANITY_API_WRITE_TOKEN=your_write_token

# Run migration
npx tsx scripts/migrate-projects-to-sanity.ts
```

This will:
1. Create Sanity documents for each project
2. Upload images to Sanity
3. Preserve all translations

## Security

### Admin Access

The following endpoints require admin authentication:
- `/studio/*` - Sanity Studio
- `/api/projects/update` - Project updates

Admin status is determined by:
1. `user.user_metadata.role === 'admin'`
2. Email domain ending with `@lago.lv`
3. Entry in `user_roles` table

### API Tokens

- **Read Token**: Only needs `viewer` permissions
- **Write Token**: Needs `editor` or `administrator` permissions

Create tokens in the [Sanity Manage Console](https://www.sanity.io/manage).

## GROQ Queries

All queries support the `lv`, `en`, and `ru` locales:

```typescript
// Get all projects
const projects = await client.fetch(projectsByLocaleQuery)

// Get single project
const project = await client.fetch(projectBySlugQuery, { slug: 'my-project' })

// Get featured projects
const featured = await client.fetch(featuredProjectsQuery)

// Get projects by category
const stoneProjects = await client.fetch(projectsByCategoryQuery, { category: 'stone' })
```

## Webhooks (Optional)

Set up a webhook in Sanity to revalidate pages when content changes:

1. Go to Sanity Manage > API > Webhooks
2. Add webhook URL: `https://your-site.com/api/revalidate`
3. Set secret and trigger on "Create", "Update", "Delete"

## Troubleshooting

### Images not loading
- Check that `NEXT_PUBLIC_SANITY_PROJECT_ID` is set
- Verify image assets exist in Sanity
- Check browser console for CORS errors

### Studio not accessible
- Ensure user is logged in
- Check that user has admin role
- Verify Supabase authentication is working

### Preview mode not working
- Check `SANITY_PREVIEW_SECRET` matches
- Verify `SANITY_API_READ_TOKEN` has correct permissions
- Ensure project has draft content

## Support

For Sanity-specific questions:
- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity Slack Community](https://slack.sanity.io/)

For LAGO-specific issues, contact the development team.
