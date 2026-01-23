import { useEffect, useRef, JSX } from 'react'
import { useMasterPasswordStore } from '../stores/masterPasswordStore'

interface AutoLockProps {
  /** Inactivity period in milliseconds before auto-lock (default 5 minutes) */
  timeoutMs?: number
}

export function AutoLock({ timeoutMs }: AutoLockProps): JSX.Element | null {
  const clearSession = useMasterPasswordStore((state) => state.clearSession)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Resets the inactivity timer */
  const resetTimer = (): void => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      clearSession() // lock vault
    }, timeoutMs)
  }

  useEffect(() => {
    // List of events to consider "activity"
    const activityEvents: Array<keyof DocumentEventMap> = [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart'
    ]

    // Attach listeners
    activityEvents.forEach((event) => document.addEventListener(event, resetTimer))

    // Start the timer initially
    resetTimer()

    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearTimeout(timerRef.current)
      activityEvents.forEach((event) => document.removeEventListener(event, resetTimer))
    }
  }, [timeoutMs, clearSession])

  // Component renders nothing visible
  return null
}
