export type SecretType =
  | 'password'
  | 'api-key'
  | 'ssh-key'
  | 'note'
  | 'totp' // 2FA / TOTP codes
  | 'credit-card' // card info
  | 'bank-account' // IBAN, routing number
  | 'crypto-key' // wallet keys / seed phrases
  | 'software-key' // software / license keys
  | 'wifi-credentials' // SSID + password
  | 'secure-url' // private URLs / dashboards
  | 'other'

export interface Secret {
  id: string
  name: string
  type: SecretType
  value: string
  username?: string
  url?: string
  notes?: string
  createdAt: Date
  lastAccessed: Date
  category?: string
}

export interface VaultSettings {
  autoLockTimeout: number // in minutes
  clipboardTimeout: number // in seconds
  useOsKeychain: boolean
  biometricEnabled: boolean
}

export type ViewMode = 'list' | 'details'
export type Category =
  | 'all'
  | 'passwords'
  | 'api-keys'
  | 'ssh-keys'
  | 'notes'
  | 'totp'
  | 'credit-cards'
  | 'bank-accounts'
  | 'crypto-keys'
  | 'software-keys'
  | 'wifi-credentials'
  | 'secure-urls'
