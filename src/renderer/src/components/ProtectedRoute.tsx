import { JSX } from 'react'
import { useMasterPasswordStore } from '../stores/masterPasswordStore'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element {
  const unlocked = useMasterPasswordStore((state) => state.unlocked)

  if (!unlocked) {
    // redirect to unlock screen if session expired
    return <Navigate to="/unlock" replace />
  }

  return children
}
