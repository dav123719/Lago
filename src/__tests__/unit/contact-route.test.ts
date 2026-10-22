import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }))
vi.mock('@/lib/email/send', () => ({ sendEmail }))

import { POST } from '@/app/api/contact/route'

function makeRequest(body: unknown, origin = 'https://lago.lv') {
  return new NextRequest('https://lago.lv/api/contact', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('contact API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SITE_URL = 'https://lago.lv'
    process.env.NODE_ENV = 'production'
    sendEmail.mockResolvedValue({ success: true })
  })

  it('rejects cross-origin submissions before sending email', async () => {
    const response = await POST(makeRequest({ name: 'A', email: 'a@example.com', message: 'Hello' }, 'https://attacker.example'))
    expect(response.status).toBe(403)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('rejects non-object and malformed field types without throwing', async () => {
    const nonObject = await POST(makeRequest(['not', 'an', 'object']))
    const badEmailType = await POST(makeRequest({ name: 'A', email: {}, message: 'Hello' }))
    expect(nonObject.status).toBe(400)
    expect(badEmailType.status).toBe(400)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('normalizes bounded input and sends escaped email content', async () => {
    const response = await POST(makeRequest({ name: '  <Ada>  ', email: ' ada@example.com ', message: '  & hello  ', phone: ' 123 ' }))
    expect(response.status).toBe(200)
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      replyTo: 'ada@example.com',
      text: '<Ada>\nada@example.com\n123\n\n& hello',
      html: expect.stringContaining('&lt;Ada&gt;'),
    }))
  })

  it('accepts the JavaScript-free URL-encoded contact form', async () => {
    const request = new NextRequest('https://lago.lv/api/contact', {
      method: 'POST',
      headers: { origin: 'https://lago.lv', 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Ada', email: 'ada@example.com', message: 'Please call me' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ text: 'Ada\nada@example.com\n\n\nPlease call me' }))
  })
})

it('rejects malformed contact JSON without attempting delivery', async () => {
  sendEmail.mockClear()
  process.env.NEXT_PUBLIC_SITE_URL = 'https://lago.lv'
  const response = await POST(new NextRequest('https://lago.lv/api/contact', {
    method: 'POST', headers: { origin: 'https://lago.lv', 'content-type': 'application/json' }, body: '{',
  }))
  expect(response.status).toBe(400)
  expect(sendEmail).not.toHaveBeenCalled()
})
