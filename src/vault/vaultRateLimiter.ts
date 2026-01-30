import { unlockVault as realUnlockVault } from './vaultUnlock'

interface AttemptInfo {
  count: number
  lastAttempt: number
  blockUntil: number | null
}

const MAX_ATTEMPTS_BEFORE_BLOCK = 5
const BASE_DELAY_MS = 5000 // 5 second base delay
const MAX_DELAY_MS = 5 * 60 * 1000 // 5 minutes max

// per-session storage for simplicity, keyed by account (if needed)
let attemptInfo: AttemptInfo = { count: 0, lastAttempt: 0, blockUntil: null }

function getBackoffTime(count: number) {
  // exponential backoff capped at MAX_DELAY_MS
  const delay = Math.min(BASE_DELAY_MS * 2 ** (count - 1), MAX_DELAY_MS)
  return delay
}

export async function unlockVaultWithRateLimit(
  password: string
): Promise<{ success: boolean; waitTime?: number }> {
  const now = Date.now()

  // Check if currently blocked
  if (attemptInfo.blockUntil && now < attemptInfo.blockUntil) {
    return { success: false, waitTime: attemptInfo.blockUntil - now }
  }

  try {
    const success = await realUnlockVault(password) // returns true/false

    if (success) {
      // reset attempts on success
      attemptInfo = { count: 0, lastAttempt: 0, blockUntil: null }
      return { success: true }
    }

    // failed attempt → increase count
    attemptInfo.count += 1
    attemptInfo.lastAttempt = now

    // calculate exponential backoff
    const delay = getBackoffTime(attemptInfo.count)
    if (attemptInfo.count >= MAX_ATTEMPTS_BEFORE_BLOCK) {
      attemptInfo.blockUntil = now + delay
      attemptInfo.count = 0 // reset counter after block
    }

    return { success: false, waitTime: delay }
  } catch {
    // treat errors as failed attempt
    attemptInfo.count += 1
    const delay = getBackoffTime(attemptInfo.count)
    if (attemptInfo.count >= MAX_ATTEMPTS_BEFORE_BLOCK) {
      attemptInfo.blockUntil = now + delay
      attemptInfo.count = 0
    }
    return { success: false, waitTime: delay }
  }
}
