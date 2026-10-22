const recoveryKey = 'lago:password-recovery'
const recoveryWindowMs = 15 * 60 * 1000

/** A UI gate only. Supabase must authorize every password update. */
export function markPasswordRecovery(userId: string) {
  try {
    sessionStorage.setItem(recoveryKey, JSON.stringify({ userId, expiresAt: Date.now() + recoveryWindowMs }))
    return true
  } catch {
    return false
  }
}

export function hasPasswordRecovery(userId: string): boolean {
  try {
    const marker = JSON.parse(sessionStorage.getItem(recoveryKey) || 'null')
    return marker?.userId === userId && typeof marker.expiresAt === 'number' && marker.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function clearPasswordRecovery() {
  try { sessionStorage.removeItem(recoveryKey) } catch { /* Storage can be blocked by the browser. */ }
}
