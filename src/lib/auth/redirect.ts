/** Accept only same-site absolute paths. This prevents OAuth callback open redirects. */
export function safeInternalRedirect(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  try {
    const origin = typeof window === 'undefined' ? 'https://lago.lv' : window.location.origin
    const target = new URL(value, origin)
    if (target.origin !== origin || target.username || target.password) return fallback
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return fallback
  }
}
