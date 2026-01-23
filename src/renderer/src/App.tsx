import { Routes, Route, Navigate } from 'react-router-dom'
import { UnlockScreen } from './screens/UnlockVault'
import { VaultScreen } from './screens/VaultScreen'
import { CustomTitleBar } from './components/CustomTitleBar'
import { JSX } from 'react'

export default function App(): JSX.Element {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Custom title bar at the top */}
      <CustomTitleBar />

      {/* Main app content, no scroll */}
      <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        <Routes>
          {/* Unlock route */}
          <Route path="/unlock" element={<UnlockScreen />} />

          {/* Protected route */}
          <Route path="/vault" element={<VaultScreen />} />

          {/* Default route */}
          <Route path="*" element={<Navigate to="/unlock" replace />} />
        </Routes>
      </div>
    </div>
  )
}
