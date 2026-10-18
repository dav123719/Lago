// AGENT slave-3 v1.0.1 - API routes verified

// ============================================
export const dynamic = "force-dynamic"

// Contact Form API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/send'

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

    if ([data.name, data.email, data.message, data.phone || ''].some(value => typeof value !== 'string' || value.length > 10000)) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }
    const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
    const result = await sendEmail({
      to: process.env.CONTACT_EMAIL || 'info@lago.lv',
      replyTo: data.email,
      subject: `Website enquiry from ${data.name.replace(/[\r\n]/g, ' ').slice(0, 100)}`,
      text: `${data.name}\n${data.email}\n${data.phone || ''}\n\n${data.message}`,
      html: `<p>${escape(data.name)} (${escape(data.email)})</p><p>${escape(data.phone || '')}</p><pre>${escape(data.message)}</pre>`,
    })
    if (!result.success) return NextResponse.json({ error: 'Contact service is temporarily unavailable. Please contact us by phone or email.' }, { status: 503 })

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
