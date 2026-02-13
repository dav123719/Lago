// AGENT slave-3 v1.0.1 - API routes verified

// ============================================
export const dynamic = "force-dynamic"

// Contact Form API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * Contact Form API Route
 * 
 * Handles contact form submissions.
 * For now, logs data to console - in production, this would:
 * - Send an email notification
 * - Store in a database
 * - Integrate with a CRM
 */
export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Log the submission (in production, send email/store in DB)
    console.log('='.repeat(50))
    console.log('New Contact Form Submission:')
    console.log('='.repeat(50))
    console.log('Name:', data.name)
    console.log('Email:', data.email)
    console.log('Phone:', data.phone || 'Not provided')
    console.log('Message:', data.message)
    console.log('Timestamp:', new Date().toISOString())
    console.log('='.repeat(50))

    // TODO: In production, add:
    // - Email notification to info@lago.lv
    // - Database storage
    // - Rate limiting
    // - CAPTCHA verification

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
