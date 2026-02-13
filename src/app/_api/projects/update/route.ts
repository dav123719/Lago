// AGENT slave-3 v1.0.1 - API routes verified

// ============================================
export const dynamic = "force-dynamic"

// Project Update API Route
// ============================================
// Server-side API for updating projects (admin only)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSanityClient } from '@sanity/client'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Environment variable validation
function validateEnv() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID')
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error('Missing environment variable: SANITY_API_WRITE_TOKEN')
  }
}

// Initialize Sanity client with write token
const sanityClient = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function PATCH(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    // Verify admin authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    // Check admin role
    const isAdmin = user.user_metadata?.role === 'admin' || 
                    user.email?.endsWith('@lago.lv')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders })
    }

    // Parse request body
    const { projectId, updates } = await request.json()

    if (!projectId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders })
    }

    // Update document in Sanity
    const result = await sanityClient
      .patch(projectId)
      .set(updates)
      .commit()

    return NextResponse.json({ 
      success: true, 
      message: 'Project updated successfully',
      result 
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Update error:', error)
    
    // Check if it's an environment variable error
    if (error instanceof Error && error.message.includes('Missing environment variable')) {
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: error.message
        },
        { status: 500, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Handle image uploads
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnv()

    // Verify admin authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    // Check admin role
    const isAdmin = user.user_metadata?.role === 'admin' || 
                    user.email?.endsWith('@lago.lv')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders })
    }

    // Handle multipart form data for image upload
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    if (!file || !projectId) {
      return NextResponse.json({ error: 'Missing file or project ID' }, { status: 400, headers: corsHeaders })
    }

    // Upload image to Sanity
    const asset = await sanityClient.assets.upload('image', file, {
      filename: file.name,
    })

    // Add image to project's gallery
    await sanityClient
      .patch(projectId)
      .setIfMissing({ gallery: [] })
      .append('gallery', [{
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      }])
      .commit()

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      asset: {
        _id: asset._id,
        url: asset.url,
      },
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Check if it's an environment variable error
    if (error instanceof Error && error.message.includes('Missing environment variable')) {
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: error.message
        },
        { status: 500, headers: corsHeaders }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500, headers: corsHeaders }
    )
  }
}
