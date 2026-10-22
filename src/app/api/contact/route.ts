// AGENT slave-3 v1.0.1 - API routes verified

// ============================================
export const dynamic = "force-dynamic"

// Contact Form API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/send'
import { requestOriginAllowed } from '@/lib/security/cart'

const MAX_BODY_BYTES = 16 * 1024

interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
}

export async function OPTIONS() {
  // This endpoint is same-origin only; deliberately do not grant cross-origin CORS.
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } })
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
    if (!requestOriginAllowed(request.headers)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Submission is too large' }, { status: 413 })
    }

    const rawBody = await request.text()
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Submission is too large' }, { status: 413 })
    }
    const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase()
    let data: unknown
    if (contentType === 'application/json') {
      data = JSON.parse(rawBody)
    } else if (contentType === 'application/x-www-form-urlencoded') {
      const fields = new URLSearchParams(rawBody)
      data = {
        name: fields.get('name'),
        email: fields.get('email'),
        phone: fields.get('phone') || undefined,
        message: fields.get('message'),
      }
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }
    const { name, email, phone, message } = data as Partial<ContactFormData>

    // Validate required fields
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string' ||
      (phone !== undefined && typeof phone !== 'string')) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()
    const normalizedMessage = message.trim()
    const normalizedPhone = phone?.trim() || ''
    if (!normalizedName || !normalizedEmail || !normalizedMessage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (normalizedName.length > 120 || normalizedEmail.length > 320 || normalizedMessage.length > 5000 || normalizedPhone.length > 40) {
      return NextResponse.json({ error: 'Submission is too large' }, { status: 413 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail) || /[\r\n]/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
    const result = await sendEmail({
      to: process.env.CONTACT_EMAIL || 'info@lago.lv',
      replyTo: normalizedEmail,
      subject: `Website enquiry from ${normalizedName.replace(/[\r\n]/g, ' ').slice(0, 100)}`,
      text: `${normalizedName}\n${normalizedEmail}\n${normalizedPhone}\n\n${normalizedMessage}`,
      html: `<p>${escape(normalizedName)} (${escape(normalizedEmail)})</p><p>${escape(normalizedPhone)}</p><pre>${escape(normalizedMessage)}</pre>`,
    })
    if (!result.success) return NextResponse.json({ error: 'Contact service is temporarily unavailable. Please contact us by phone or email.' }, { status: 503 })

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
