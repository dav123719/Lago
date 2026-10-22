export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { calculateRates } from '@/lib/shipping/rates'
import type { RateCalculationInput } from '@/lib/shipping/rates'

const MAX_BODY_BYTES = 4096
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  // Quotes are advisory and must be recalculated for each submitted cart.
  'Cache-Control': 'no-store',
}

class InvalidInput extends Error {}

function parseAmount(value: unknown, fallback?: number): number {
  if (value === undefined || value === null) {
    if (fallback !== undefined) return fallback
    throw new InvalidInput('Missing subtotal')
  }
  if (typeof value !== 'number' && typeof value !== 'string') throw new InvalidInput('Invalid amount')
  if (typeof value === 'string' && !/^\d+(?:\.\d+)?$/.test(value)) throw new InvalidInput('Invalid amount')
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0 || amount > 99_999_999) throw new InvalidInput('Invalid amount')
  return amount
}

function buildInput(country: unknown, subtotal: unknown, weightKg: unknown): RateCalculationInput {
  if (typeof country !== 'string' || !/^[a-z]{2}$/i.test(country)) {
    throw new InvalidInput('Country must be a two-letter code')
  }
  return {
    // Current configured methods use country, subtotal and weight only. Do not
    // retain address/contact fields in a process cache or log submitted data.
    address: {
      firstName: '', lastName: '', email: '', phone: '', city: '', postalCode: '',
      addressLine1: '', country: country.toUpperCase(),
    },
    subtotal: parseAmount(subtotal),
    weightKg: parseAmount(weightKg, 0),
  }
}

async function quote(input: RateCalculationInput) {
  // This is a small in-process calculation over configured methods, not an
  // upstream request. Caching arbitrary postal codes/subtotals only grew memory.
  const { rates } = await calculateRates(input)
  return NextResponse.json({ rates }, { headers: responseHeaders })
}

function handleError(error: unknown) {
  if (error instanceof InvalidInput) {
    return NextResponse.json({ error: error.message }, { status: 400, headers: responseHeaders })
  }
  console.error('Shipping rate calculation failed')
  return NextResponse.json({ error: 'Failed to calculate shipping rates' }, { status: 500, headers: responseHeaders })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: responseHeaders })
}

export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Submission is too large' }, { status: 413, headers: responseHeaders })
    }
    const rawBody = await request.text()
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Submission is too large' }, { status: 413, headers: responseHeaders })
    }
    let body: unknown
    try { body = JSON.parse(rawBody) } catch { throw new InvalidInput('Invalid JSON submission') }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new InvalidInput('Invalid submission')
    const { address, subtotal, weightKg } = body as Record<string, unknown>
    if (!address || typeof address !== 'object' || Array.isArray(address)) throw new InvalidInput('Missing address')
    return await quote(buildInput((address as Record<string, unknown>).country, subtotal, weightKg))
  } catch (error) {
    return handleError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    return await quote(buildInput(searchParams.get('country'), searchParams.get('subtotal') ?? 0, searchParams.get('weightKg')))
  } catch (error) {
    return handleError(error)
  }
}
