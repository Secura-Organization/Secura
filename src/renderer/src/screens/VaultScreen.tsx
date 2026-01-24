import { useState, useMemo, JSX, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { SecretsList } from '../components/SecretsList'
import { SecretDetails } from '../components/SecretDetails'
import { EmptyDetails } from '../components/EmptyDetails'
import { SettingsScreen } from './SettingsScreen'
import { AddEditSecretModal } from '../components/AddEditSecretModal'
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog'
import type { Secret, Category } from '../../../types/vault'
import { useMasterPasswordStore } from '../stores/masterPasswordStore'

const secretTypes: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Secrets' },
  { id: 'passwords', label: 'Passwords' },
  { id: 'api-keys', label: 'API Keys' },
  { id: 'ssh-keys', label: 'SSH Keys' },
  { id: 'notes', label: 'Secure Notes' },
  { id: 'totp', label: 'TOTP / 2FA' },
  { id: 'credit-cards', label: 'Credit Cards' },
  { id: 'bank-accounts', label: 'Bank Accounts' },
  { id: 'crypto-keys', label: 'Crypto Keys' },
  { id: 'software-keys', label: 'Software Keys' },
  { id: 'wifi-credentials', label: 'Wi-Fi' },
  { id: 'secure-urls', label: 'Secure URLs' }
]

export function VaultScreen(): JSX.Element {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSecretId, setSelectedSecretId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null)
  const [deletingSecret, setDeletingSecret] = useState<Secret | null>(null)

  useEffect(() => {
    const loadSecrets = async (): Promise<void> => {
      const secrets = await window.vault.getSecrets(
        useMasterPasswordStore.getState().sessionKey as string
      )
      setSecrets(secrets)
    }

    loadSecrets()
  }, [])

  // Filter secrets by category & search
  const filteredSecrets = useMemo(() => {
    return secrets.filter((secret) => {
      // Category filter
      if (activeCategory === 'all') return true

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

      if (categoryMap[activeCategory] && secret.type !== categoryMap[activeCategory]) {
        return false
      }

      // Search filter
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        secret.name.toLowerCase().includes(q) ||
        secret.username?.toLowerCase().includes(q) ||
        secret.url?.toLowerCase().includes(q)
      )
    })
  }, [secrets, activeCategory, searchQuery])

  // Selected secret
  const selectedSecret = useMemo(() => {
    return secrets.find((s) => s.id === selectedSecretId) || null
  }, [secrets, selectedSecretId])

  // Secret counts
  const secretCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: secrets.length
    }

    // Initialize all other types
    secretTypes.forEach((type) => {
      if (type.id !== 'all') counts[type.id] = 0
    })

    // Count secrets dynamically
    secrets.forEach((s) => {
      switch (s.type) {
        case 'password':
          counts.passwords += 1
          break
        case 'api-key':
          counts['api-keys'] += 1
          break
        case 'ssh-key':
          counts['ssh-keys'] += 1
          break
        case 'note':
          counts.notes += 1
          break
        case 'totp':
          counts.totp += 1
          break
        case 'credit-card':
          counts['credit-cards'] += 1
          break
        case 'bank-account':
          counts['bank-accounts'] += 1
          break
        case 'crypto-key':
          counts['crypto-keys'] += 1
          break
        case 'software-key':
          counts['software-keys'] += 1
          break
        case 'wifi-credentials':
          counts['wifi-credentials'] += 1
          break
        case 'secure-url':
          counts['secure-urls'] += 1
          break
        default:
          break
      }
    })

    return counts
  }, [secrets])

  // Delete secret
  const handleDeleteSecret = (): void => {
    if (!deletingSecret) return
    setSecrets(secrets.filter((s) => s.id !== deletingSecret.id))
    if (selectedSecretId === deletingSecret.id) setSelectedSecretId(null)
    setDeletingSecret(null)
  }

  // Select secret
  const handleSelectSecret = (secret: Secret): void => {
    setSelectedSecretId(secret.id)
    setSecrets(secrets.map((s) => (s.id === secret.id ? { ...s, lastAccessed: new Date() } : s)))
  }

  if (showSettings) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onSettingsClick={() => setShowSettings(true)}
          secretCounts={secretCounts}
        />
        <div className="flex-1">
          <SettingsScreen onBack={() => setShowSettings(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat)
          setSearchQuery('')
        }}
        onSettingsClick={() => setShowSettings(true)}
        secretCounts={secretCounts}
      />

      {/* Secrets List */}
      <div className="w-80 border-r border-border">
        <SecretsList
          secrets={filteredSecrets}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSecretId={selectedSecretId}
          onSelectSecret={handleSelectSecret}
          onAddSecret={() => setShowAddModal(true)}
          category={activeCategory}
        />
      </div>

      {/* Secret Details */}
      <div className="flex-1">
        {selectedSecret ? (
          <SecretDetails
            key={selectedSecret.id}
            secret={selectedSecret}
            onEdit={() => setEditingSecret(selectedSecret)}
            onDelete={async (): Promise<void> => {
              const secrets = await window.vault.getSecrets(
                useMasterPasswordStore.getState().sessionKey as string
              )
              setSecrets(secrets)
            }}
          />
        ) : (
          <EmptyDetails />
        )}
      </div>

      {/* Add/Edit Secret Modal */}
      <AddEditSecretModal
        key={editingSecret?.id ?? 'new'}
        isOpen={showAddModal || !!editingSecret}
        onClose={() => {
          setShowAddModal(false)
          setEditingSecret(null)
        }}
        onSave={async (): Promise<void> => {
          const secrets = await window.vault.getSecrets(
            useMasterPasswordStore.getState().sessionKey as string
          )
          setSecrets(secrets)
        }}
        editingSecret={editingSecret}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deletingSecret}
        secret={deletingSecret}
        onConfirm={handleDeleteSecret}
        onCancel={() => setDeletingSecret(null)}
      />
    </div>
  )
}
