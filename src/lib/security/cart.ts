/** Compare parsed origins; prefix matching accepts attacker-controlled lookalike hosts. */
export function isAllowedOrigin(origin: string | null, referer: string | null, allowed: string[]) {
  try {
    const candidate = new URL(origin ?? referer ?? '')
    return ['https:', 'http:'].includes(candidate.protocol) && allowed.some(value => {
      try { return new URL(value).origin === candidate.origin } catch { return false }
    })
  } catch { return false }
}

export function isValidQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= 999
}

export function ownsCart(cart: { user_id?: string | null; guest_session_id?: string | null; status?: string }, userId?: string | null, sessionId?: string | null) {
  if (cart.status !== 'active') return false
  if (cart.user_id) return Boolean(userId && cart.user_id === userId)
  return Boolean(sessionId && cart.guest_session_id === sessionId)
}

export function requestOriginAllowed(headers: Headers) {
  const allowed = [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_APP_URL].filter((value): value is string => Boolean(value))
  if (process.env.NODE_ENV !== 'production') allowed.push('http://localhost:3000', 'http://127.0.0.1:3000')
  return isAllowedOrigin(headers.get('origin'), headers.get('referer'), allowed)
}
