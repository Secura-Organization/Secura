import {
  Key,
  KeyRound,
  Terminal,
  FileText,
  CreditCard,
  Hash,
  Wifi,
  Globe,
  KeySquare
} from 'lucide-react'
import type { SecretType } from '../../../types/vault'
import { JSX } from 'react'

interface SecretTypeIconProps {
  type: SecretType
  size?: number
  className?: string
}

export function SecretTypeIcon({
  type,
  size = 18,
  className = ''
}: SecretTypeIconProps): JSX.Element {
  const icons: Record<SecretType, any> = {
    password: KeyRound,
    'api-key': Key,
    'ssh-key': Terminal,
    note: FileText,
    totp: Hash,
    'credit-card': CreditCard,
    'bank-account': KeySquare,
    'crypto-key': Key,
    'software-key': KeySquare,
    'wifi-credentials': Wifi,
    'secure-url': Globe,
    other: Hash
  }

  const colors: Record<SecretType, string> = {
    password: 'text-primary',
    'api-key': 'text-warning',
    'ssh-key': 'text-success',
    note: 'text-muted-foreground',
    totp: 'text-info',
    'credit-card': 'text-pink-500',
    'bank-account': 'text-indigo-500',
    'crypto-key': 'text-purple-500',
    'software-key': 'text-orange-500',
    'wifi-credentials': 'text-teal-500',
    'secure-url': 'text-cyan-500',
    other: 'text-muted-foreground'
  }

  const Icon = icons[type]

  if (!Icon) {
    console.error('No icon found for type:', type)
    return <Hash size={size} className={`${className}`} />
  }

  return <Icon size={size} className={`${colors[type]} ${className}`} />
}
