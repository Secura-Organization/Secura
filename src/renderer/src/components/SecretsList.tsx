import { Search, Plus, Inbox } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button/button'
import { SecretTypeIcon } from './SecretTypeIcon'
import type { Secret, Category } from '../../../types/vault'
import { formatDistanceToNow } from 'date-fns'
import { JSX } from 'react'

interface SecretsListProps {
  secrets: Secret[]
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSecretId: string | null
  onSelectSecret: (secret: Secret) => void
  onAddSecret: () => void
  category: Category
}

export function SecretsList({
  secrets,
  searchQuery,
  onSearchChange,
  selectedSecretId,
  onSelectSecret,
  onAddSecret,
  category
}: SecretsListProps): JSX.Element {
  // --- Filter secrets based on selected category and search query
  const filteredSecrets = secrets.filter((secret) => {
    // --- Match category
    const categoryMap: Record<Category, string> = {
      passwords: 'password',
      'api-keys': 'api-key',
      'ssh-keys': 'ssh-key',
      notes: 'note',
      totp: 'totp',
      'credit-cards': 'credit-card',
      'bank-accounts': 'bank-account',
      'crypto-keys': 'crypto-key',
      'software-keys': 'software-key',
      'wifi-credentials': 'wifi-credentials',
      'secure-urls': 'secure-url',
      all: ''
    }

    const matchesCategory = category === 'all' || categoryMap[category] === secret.type

    // --- Match search
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      secret.name.toLowerCase().includes(q) ||
      secret.username?.toLowerCase().includes(q) ||
      secret.value.toLowerCase().includes(q)

    return matchesCategory && matchesSearch
  })

  // --- Display category title
  const getCategoryTitle = (cat: Category | 'other'): string => {
    const titles: Record<string, string> = {
      all: 'All Secrets',
      passwords: 'Passwords',
      'api-keys': 'API Keys',
      'ssh-keys': 'SSH Keys',
      notes: 'Secure Notes',
      totp: 'TOTP / 2FA Codes',
      'credit-cards': 'Credit Cards',
      'bank-accounts': 'Bank Accounts',
      'crypto-keys': 'Crypto Keys',
      'software-keys': 'Software / License Keys',
      'wifi-credentials': 'Wi-Fi Credentials',
      'secure-urls': 'Secure URLs',
      other: 'Other Secrets'
    }

    return titles[cat] ?? 'Other Secrets'
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">{getCategoryTitle(category)}</h1>
          <Button size="sm" onClick={onAddSecret} className="gap-1.5">
            <Plus size={16} />
            Add
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            type="text"
            placeholder="Search secrets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
        </div>
      </div>

      {/* Secrets List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredSecrets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Inbox className="w-8 h-8 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-1">No secrets yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first secret to get started. Everything is encrypted locally.
            </p>
            <Button size="sm" onClick={onAddSecret} variant="outline" className="gap-1.5">
              <Plus size={16} />
              Add Secret
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {filteredSecrets.reverse().map((secret) => (
              <button
                key={secret.id}
                onClick={() => onSelectSecret(secret)}
                className={`w-full p-3 rounded-lg text-left transition-fast group ${
                  selectedSecretId === secret.id ? 'bg-accent' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-background transition-fast">
                    <SecretTypeIcon type={secret.type} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{secret.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(secret.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
