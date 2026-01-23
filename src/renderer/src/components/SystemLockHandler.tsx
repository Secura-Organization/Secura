import { JSX, useEffect } from 'react'
import { useMasterPasswordStore } from '../stores/masterPasswordStore'

export function SystemLockHandler(): JSX.Element | null {
  const clearSession = useMasterPasswordStore((state) => state.clearSession)

  useEffect(() => {
    const listener = (): void => {
      clearSession() // lock vault immediately
    }

    // Use preload-exposed API
    window.electron.onSystemLock(listener)

    return () => {}
  }, [clearSession])

  return null // nothing visible
}
