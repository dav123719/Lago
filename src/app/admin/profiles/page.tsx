'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Loader2, Search, Save } from 'lucide-react'

type Profile = {
  id: string; email: string; full_name: string | null; first_name: string | null
  last_name: string | null; phone: string | null; avatar_url: string | null
  bio: string | null; preferred_language: string
}

export default function AdminProfilesPage() {
  const [query, setQuery] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const load = useCallback(async (value = query) => {
    setLoading(true); setMessage('')
    try {
      const response = await fetch(`/api/admin/profiles?q=${encodeURIComponent(value)}`, { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load profiles')
      setProfiles(result.profiles)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load profiles')
    } finally { setLoading(false) }
  }, [query])
  useEffect(() => {
    const timer = window.setTimeout(() => { void load('') }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function save(event: FormEvent<HTMLFormElement>, profile: Profile) {
    event.preventDefault(); setMessage(''); setSavingId(profile.id)
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/admin/profiles/', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id, full_name: form.get('full_name'), first_name: form.get('first_name'),
          last_name: form.get('last_name'), phone: form.get('phone'), bio: form.get('bio'),
          avatar_url: form.get('avatar_url') || null, preferred_language: form.get('preferred_language'),
        }),
      })
      const result = await response.json()
      if (!response.ok) { setMessage(result.error || 'Save failed'); return }
      setMessage(`Saved ${profile.email}`)
      await load()
    } catch {
      setMessage('Could not save profile. Check the connection and try again.')
    } finally {
      setSavingId(null)
    }
  }

  return <main className="mx-auto max-w-5xl px-5 py-12 text-white">
    <h1 className="mb-2 text-3xl">Account profiles</h1>
    <p className="mb-8 text-white/65">Search users and edit application profile fields. Authentication email and access roles are managed separately.</p>
    <form className="mb-6 flex gap-2" onSubmit={event => { event.preventDefault(); void load(query) }}>
      <label className="sr-only" htmlFor="profile-search">Search by name or email</label>
      <input id="profile-search" className="min-w-0 flex-1 rounded border border-white/20 bg-black px-3 py-2" value={query} onChange={event => setQuery(event.target.value)} />
      <button className="inline-flex items-center gap-2 rounded bg-white/10 px-4 py-2" type="submit"><Search size={16}/> Search</button>
    </form>
    {message && <p role="status" aria-live="polite" className="mb-4">{message}</p>}
    {loading ? <Loader2 className="animate-spin" aria-label="Loading profiles"/> : profiles.length === 0 ? <p>No profiles found.</p> :
      <div className="space-y-5">{profiles.map(profile => <form key={profile.id} onSubmit={event => void save(event, profile)} className="grid gap-3 rounded-xl border border-white/15 p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 font-semibold">{profile.email}</h2>
        <input aria-label="Full name" name="full_name" defaultValue={profile.full_name || ''} placeholder="Full name" className="rounded border border-white/20 bg-black px-3 py-2" />
        <input aria-label="First name" name="first_name" defaultValue={profile.first_name || ''} placeholder="First name" className="rounded border border-white/20 bg-black px-3 py-2" />
        <input aria-label="Last name" name="last_name" defaultValue={profile.last_name || ''} placeholder="Last name" className="rounded border border-white/20 bg-black px-3 py-2" />
        <input aria-label="Phone" name="phone" defaultValue={profile.phone || ''} placeholder="Phone" className="rounded border border-white/20 bg-black px-3 py-2" />
        <input aria-label="Avatar URL" name="avatar_url" defaultValue={profile.avatar_url || ''} placeholder="Avatar URL (https)" className="rounded border border-white/20 bg-black px-3 py-2" />
        <select aria-label="Preferred language" name="preferred_language" defaultValue={profile.preferred_language} className="rounded border border-white/20 bg-black px-3 py-2"><option value="lv">Latviešu</option><option value="en">English</option><option value="ru">Русский</option></select>
        <textarea aria-label="Bio" name="bio" defaultValue={profile.bio || ''} maxLength={500} placeholder="Bio" className="rounded border border-white/20 bg-black px-3 py-2 md:col-span-2" />
        <button disabled={savingId === profile.id} className="inline-flex items-center justify-center gap-2 rounded bg-lago-gold px-4 py-2 font-semibold text-black disabled:cursor-wait disabled:opacity-60 md:col-span-2" type="submit">{savingId === profile.id ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} {savingId === profile.id ? 'Saving…' : 'Save profile'}</button>
      </form>)}</div>}
  </main>
}
