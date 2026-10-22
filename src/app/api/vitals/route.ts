import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store' }
let windowStart = 0
let accepted = 0
const groups = ['public', 'surfaces', 'projects', 'store', 'account', 'admin', 'auth']

export async function POST(request: NextRequest) {
  const site = request.headers.get('sec-fetch-site')
  if (site && site !== 'same-origin') return NextResponse.json({ error: 'Invalid origin' }, { status: 403, headers })
  if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ error: 'JSON required' }, { status: 415, headers })
  const reader = request.body?.getReader()
  if (!reader) return NextResponse.json({ error: 'Invalid metric' }, { status: 400, headers })
  const parts: Uint8Array[] = []
  let bytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    bytes += value.length
    if (bytes > 512) { await reader.cancel(); return NextResponse.json({ error: 'Metric too large' }, { status: 413, headers }) }
    parts.push(value)
  }
  let body: Record<string, unknown>
  try { body = JSON.parse(Buffer.concat(parts).toString('utf8')) } catch { return NextResponse.json({ error: 'Invalid metric' }, { status: 400, headers }) }
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.name !== 'string' || !['LCP', 'INP', 'CLS'].includes(body.name) ||
      typeof body.device !== 'string' || !['mobile', 'desktop'].includes(body.device) || typeof body.group !== 'string' || !groups.includes(body.group) ||
      typeof body.value !== 'number' || !Number.isFinite(body.value) || body.value < 0 || body.value > (body.name === 'CLS' ? 10 : 120000) ||
      Object.keys(body).some(key => !['name', 'value', 'device', 'group'].includes(key))) {
    return NextResponse.json({ error: 'Invalid metric' }, { status: 400, headers })
  }
  const now = Date.now()
  if (now - windowStart >= 60000) { windowStart = now; accepted = 0 }
  // Global bounded counter; no IP-derived or persistent identifiers are stored.
  if (++accepted > 300) return new NextResponse(null, { status: 429, headers })
  console.info('LAGO_VITAL ' + JSON.stringify({ name: body.name, value: body.value, device: body.device, group: body.group }))
  return new NextResponse(null, { status: 204, headers })
}
