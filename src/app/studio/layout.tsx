export const dynamic = 'force-dynamic'
// ============================================
// Studio Layout
// ============================================
// Protected layout for Sanity Studio

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSanityConfigured } from '@/lib/sanity/config'

export const metadata = {
  title: 'LAGO Studio',
  description: 'Content management for LAGO luxury furniture',
}

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if Sanity is configured
  if (!isSanityConfigured()) {
    return (
      <>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#e0e0e0',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 style={{ color: '#c9a962', marginBottom: '1rem' }}>Sanity Not Configured</h1>
            <p>Please set up your Sanity environment variables.</p>
          </div>
        </div>
      </>
    )
  }

  // Check if user is authenticated and has admin role
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/lv/?login=1')
  }

  // Check admin role in user metadata or database
  const isAdmin = user.app_metadata?.role === 'admin'

  if (!isAdmin) {
    redirect('/?error=unauthorized')
  }

  return (
    <>
      <div style={{ margin: 0 }}>
        {children}
      </div>
    </>
  )
}

async function checkAdminRole(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single()

    if (error) return false
    return !!data
  } catch {
    return false
  }
}
