import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  return !origin || origin === request.nextUrl.origin
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
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (!authorized) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 })
  const query = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 120)
  const { data, error } = await supabase.rpc('admin_search_profiles', { p_query: query || null, p_limit: 100 })
  if (error) return NextResponse.json({ error: 'Could not load profiles' }, { status: 500 })
  return NextResponse.json({ profiles: data })
}

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  const { supabase, user, authorized } = await authorizedClient()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (!authorized) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
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
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id) ||
    [fullName, firstName, lastName, phone, avatarUrl, bio].some(value => value === undefined) ||
    (avatarUrl && !/^https:\/\//i.test(avatarUrl)) || !['lv', 'en', 'ru'].includes(String(language))) {
    return NextResponse.json({ error: 'Invalid profile fields' }, { status: 400 })
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
  if (error) return NextResponse.json({ error: 'Profile could not be updated' }, { status: error.code === '42501' ? 403 : 400 })
  return NextResponse.json({ profile: data })
}
