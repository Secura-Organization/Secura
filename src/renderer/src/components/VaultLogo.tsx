import { Shield } from 'lucide-react'
import { JSX } from 'react'

interface VaultLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function VaultLogo({ size = 'md', showText = true }: VaultLogoProps): JSX.Element {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' }
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
        <div className="relative p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
          <Shield size={sizes[size].icon} className="text-primary" strokeWidth={1.5} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-semibold tracking-tight ${sizes[size].text}`}>Secura</span>
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground tracking-wide">
              Password & Secrets Manager
            </span>
          )}
        </div>
      )}
    </div>
  )
}
