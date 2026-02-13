// AGENT slave-3 v1.0.1 - API routes verified

// ============================================
export const dynamic = "force-dynamic"

// Preview API Route
// ============================================
// Enable preview mode for viewing drafts

import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Import from sanity directory using @sanity alias
import { getClient } from '@sanity/lib/client'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Project query for preview
const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  _type,
  title,
  slug,
  description,
  mainImage,
  images,
  category,
  location,
  completionDate,
  area,
  client,
  featured,
  order
}`

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const slug = searchParams.get('slug')

    // Check preview secret
    if (token !== process.env.SANITY_PREVIEW_SECRET) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders })
    }

    // Enable draft mode
    const draft = await draftMode()
    draft.enable()

    // Fetch the draft document if slug provided
    if (slug) {
      try {
        const client = getClient(true)
        const project = await client.fetch(projectBySlugQuery, { slug })
        
        return NextResponse.json({ 
          enabled: true, 
          project,
          message: 'Preview mode enabled'
        }, { headers: corsHeaders })
      } catch (error) {
        console.error('Preview fetch error:', error)
        return NextResponse.json({ 
          enabled: true,
          error: 'Failed to fetch draft'
        }, { headers: corsHeaders })
      }
    }

    return NextResponse.json({ 
      enabled: true,
      message: 'Preview mode enabled'
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Failed to enable preview mode' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const draft = await draftMode()
    draft.disable()

    return NextResponse.json({ 
      enabled: false,
      message: 'Preview mode disabled'
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Preview disable error:', error)
    return NextResponse.json(
      { error: 'Failed to disable preview mode' },
      { status: 500, headers: corsHeaders }
    )
  }
}
