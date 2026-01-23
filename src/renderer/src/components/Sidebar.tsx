import {
  Key,
  KeyRound,
  Terminal,
  FileText,
  Settings,
  Lock,
  Layers,
  CreditCard,
  Hash,
  Wifi,
  Globe,
  KeySquare
} from 'lucide-react'
import { VaultLogo } from './VaultLogo'
import type { Category } from '../../../types/vault'
import { JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMasterPasswordStore } from '../stores/masterPasswordStore'

interface SidebarProps {
  activeCategory: Category
  onCategoryChange: (category: Category) => void
  onSettingsClick: () => void
  secretCounts: Record<Category, number>
}

const categories: { id: Category; label: string; icon: typeof Key }[] = [
  { id: 'all' as Category, label: 'All Secrets', icon: Layers },
  { id: 'passwords' as Category, label: 'Passwords', icon: KeyRound },
  { id: 'api-keys' as Category, label: 'API Keys', icon: Key },
  { id: 'ssh-keys' as Category, label: 'SSH Keys', icon: Terminal },
  { id: 'notes' as Category, label: 'Secure Notes', icon: FileText },
  { id: 'totp' as Category, label: 'TOTP / 2FA', icon: Hash },
  { id: 'credit-cards' as Category, label: 'Credit Cards', icon: CreditCard },
  { id: 'bank-accounts' as Category, label: 'Bank Accounts', icon: KeySquare },
  { id: 'crypto-keys' as Category, label: 'Crypto Keys', icon: Key },
  { id: 'software-keys' as Category, label: 'Software Keys', icon: KeySquare },
  { id: 'wifi-credentials' as Category, label: 'Wi-Fi', icon: Wifi },
  { id: 'secure-urls' as Category, label: 'Secure URLs', icon: Globe }
]

export function Sidebar({
  activeCategory,
  onCategoryChange,
  onSettingsClick,
  secretCounts
}: SidebarProps): JSX.Element {
  const navigate = useNavigate()

  return (
    <aside className="w-60 h-[calc(100vh-30px)] bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <VaultLogo size="sm" />
      </div>

      {/* Navigation (scrollable) */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id
          const count = secretCounts[category.id] ?? 0

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`sidebar-item w-full justify-between group ${
                isActive ? 'sidebar-item-active' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={
                    isActive
                      ? 'text-sidebar-accent-foreground'
                      : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                  }
                />
                <span>{category.label}</span>
              </div>
              {count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-sidebar-primary/20 text-sidebar-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer Actions (always visible) */}
      <div className="p-3 border-t border-sidebar-border flex-shrink-0 flex flex-col space-y-1 bg-sidebar">
        <button onClick={onSettingsClick} className="sidebar-item w-full justify-start gap-3">
          <Settings size={18} className="text-muted-foreground" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => {
            useMasterPasswordStore.getState().clearSession()
            navigate('/unlock')
          }}
          className="sidebar-item w-full justify-start gap-3 text-destructive hover:text-destructive/80"
        >
          <Lock size={18} />
          <span>Lock Vault</span>
        </button>
      </div>
    </aside>
  )
}
