import React, { JSX } from 'react'
import { Maximize, Minimize2, X } from 'lucide-react'

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      maximize: () => void
      close: () => void
    }
  }
}

// Extend CSSProperties for WebkitAppRegion
interface CustomCSSProperties extends React.CSSProperties {
  WebkitAppRegion?: string
}

const titleBarStyle: CustomCSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '32px',
  backgroundColor: '#000',
  color: '#fff',
  WebkitAppRegion: 'drag',
  padding: '0 8px'
}

const buttonContainerStyle: CustomCSSProperties = {
  display: 'flex',
  gap: '8px',
  WebkitAppRegion: 'no-drag'
}

const buttonStyle: CustomCSSProperties = {
  width: '36px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  transition: 'background 0.2s'
}

// Hover effect
const hoverStyle = {
  backgroundColor: 'rgba(255,255,255,0.1)'
}

export function CustomTitleBar(): JSX.Element {
  return (
    <div style={titleBarStyle}>
      <span style={{ fontWeight: 600 }}>Secura</span>
      <div style={buttonContainerStyle}>
        <button
          style={buttonStyle}
          onClick={() => window.electronAPI.minimize()}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor!)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Minimize"
        >
          <Minimize2 size={16} />
        </button>
        <button
          style={buttonStyle}
          onClick={() => window.electronAPI.maximize()}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor!)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Maximize"
        >
          <Maximize size={16} />
        </button>
        <button
          style={{ ...buttonStyle, color: '#ff5f56' }}
          onClick={() => window.electronAPI.close()}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.2)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
