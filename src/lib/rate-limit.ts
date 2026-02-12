const attempts = new Map<string, { count: number; lastAttempt: number }>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || now - record.lastAttempt > WINDOW_MS) {
    attempts.set(key, { count: 1, lastAttempt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  record.lastAttempt = now
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count }
}

export function resetRateLimit(key: string) {
  attempts.delete(key)
}
