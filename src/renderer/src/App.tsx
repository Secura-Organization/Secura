import { Routes, Route, Navigate } from 'react-router-dom'
import { UnlockScreen } from './screens/UnlockVault'
import { VaultScreen } from './screens/VaultScreen'
import { CustomTitleBar } from './components/CustomTitleBar'
import { JSX } from 'react'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AutoLock } from './components/AutoLockProvider'
import { SystemLockHandler } from './components/SystemLockHandler'

export default function App(): JSX.Element {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SystemLockHandler />
      <AutoLock timeoutMs={0.5 * 60 * 1000} />
      {/* Custom title bar at the top */}
      <CustomTitleBar />

      {/* Main app content, no scroll */}
      <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        <Routes>
          {/* Unlock route */}
          <Route path="/unlock" element={<UnlockScreen />} />

          {/* Protected route */}
          <Route
            path="/vault"
            element={
              <ProtectedRoute>
                <VaultScreen />
              </ProtectedRoute>
            }
          />

          {/* Default route */}
          <Route path="*" element={<Navigate to="/unlock" replace />} />
        </Routes>
      </div>
    </div>
  )
}
