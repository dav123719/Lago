import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requestOriginAllowed } from '@/lib/security/cart'

export const dynamic = 'force-dynamic'

function privateJson(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...init?.headers, 'Cache-Control': 'private, no-store, max-age=0', 'CDN-Cache-Control': 'no-store' },
  })
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  // Apache forwards HTTPS to a loopback HTTP listener. Its internal URL is not
  // the browser's origin; compare against trusted configured public origins.
  return !origin || requestOriginAllowed(request.headers)
}

async function authorizedClient() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { supabase, user: null, authorized: false }
  const { data, error } = await supabase.rpc('is_current_user_admin')
  return { supabase, user, authorized: !error && data === true }
}

export async function GET(request: NextRequest) {
  const { supabase, user, authorized } = await authorizedClient()
  if (!user) return privateJson({ error: 'Authentication required' }, { status: 401 })
  if (!authorized) return privateJson({ error: 'Administrator access required' }, { status: 403 })
  const query = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 120)
  const { data, error } = await supabase.rpc('admin_search_profiles', { p_query: query || null, p_limit: 100 })
  if (error) return privateJson({ error: 'Could not load profiles' }, { status: 500 })
  return privateJson({ profiles: data })
}

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request)) return privateJson({ error: 'Invalid request origin' }, { status: 403 })
  const { supabase, user, authorized } = await authorizedClient()
  if (!user) return privateJson({ error: 'Authentication required' }, { status: 401 })
  if (!authorized) return privateJson({ error: 'Administrator access required' }, { status: 403 })

  let body: Record<string, unknown>
  try {
    const value: unknown = await request.json()
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return privateJson({ error: 'Invalid JSON body' }, { status: 400 })
    }
    body = value as Record<string, unknown>
  } catch { return privateJson({ error: 'Invalid JSON body' }, { status: 400 }) }
  const bounded = (key: string, max: number) => {
    const value = body[key]
    if (value === null || value === undefined || value === '') return null
    return typeof value === 'string' && value.length <= max ? value.trim() : undefined
  }
  const id = body.id
  const fullName = bounded('full_name', 120)
  const firstName = bounded('first_name', 100)
  const lastName = bounded('last_name', 100)
  const phone = bounded('phone', 50)
  const avatarUrl = bounded('avatar_url', 2048)
  const bio = bounded('bio', 500)
  const language = body.preferred_language
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
    [fullName, firstName, lastName, phone, avatarUrl, bio].some(value => value === undefined) ||
    (avatarUrl && !/^https:\/\//i.test(avatarUrl)) || !['lv', 'en', 'ru'].includes(String(language))) {
    return privateJson({ error: 'Invalid profile fields' }, { status: 400 })
  }
  const { data, error } = await supabase.rpc('admin_update_profile', {
    p_user_id: id,
    p_full_name: fullName,
    p_first_name: firstName,
    p_last_name: lastName,
    p_phone: phone,
    p_avatar_url: avatarUrl,
    p_bio: bio,
    p_preferred_language: String(language),
  })
  if (error) return privateJson({ error: 'Profile could not be updated' }, { status: error.code === '42501' ? 403 : 400 })
  return privateJson({ profile: data })
}
