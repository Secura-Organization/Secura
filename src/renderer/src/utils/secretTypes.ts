import { SecretType } from '../../../types/vault'

const SECRET_TYPE_LABELS: Record<SecretType, string> = {
  password: 'Password',
  'api-key': 'API Key',
  'ssh-key': 'SSH Key',
  note: 'Secure Note',
  totp: '2FA / TOTP Code',
  'credit-card': 'Credit Card',
  'bank-account': 'Bank Account',
  'crypto-key': 'Crypto Key',
  'software-key': 'Software / License Key',
  'wifi-credentials': 'Wi-Fi Credentials',
  'secure-url': 'Secure URL',
  other: 'Other Secret'
}

export function getSecretTypeLabel(type: SecretType): string {
  return SECRET_TYPE_LABELS[type] ?? 'Unknown'
}
