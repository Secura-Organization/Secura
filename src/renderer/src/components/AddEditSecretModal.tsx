import { useState, JSX } from 'react'
import {
  X,
  Eye,
  EyeOff,
  Key,
  KeyRound,
  Terminal,
  FileText,
  CreditCard,
  Hash,
  Wifi,
  Globe,
  KeySquare,
  SquareAsterisk
} from 'lucide-react'
import { Button } from '../components/ui/button/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import type { Secret, SecretType } from '../../../types/vault'

interface AddEditSecretModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editingSecret?: Secret | null
}

interface PasswordStrength {
  label: string
  color: string
  width: string
}

// --- Initial / main secret types
const mainSecretTypes: { type: SecretType; label: string; icon: typeof Key }[] = [
  { type: 'password', label: 'Password', icon: KeyRound },
  { type: 'api-key', label: 'API Key', icon: Key },
  { type: 'ssh-key', label: 'SSH Key', icon: Terminal },
  { type: 'other', label: 'Other', icon: Hash }
]

// --- All secret types for "Other"
const otherSecretTypes: { type: SecretType; label: string; icon: typeof Key }[] = [
  { type: 'note', label: 'Secure Note', icon: FileText },
  { type: 'totp', label: 'TOTP / 2FA', icon: SquareAsterisk },
  { type: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { type: 'bank-account', label: 'Bank Account', icon: KeySquare },
  { type: 'crypto-key', label: 'Crypto Key', icon: Key },
  { type: 'software-key', label: 'Software Key', icon: KeySquare },
  { type: 'wifi-credentials', label: 'Wi-Fi', icon: Wifi },
  { type: 'secure-url', label: 'Secure URL', icon: Globe }
]

export function AddEditSecretModal({
  isOpen,
  onClose,
  onSave,
  editingSecret
}: AddEditSecretModalProps): JSX.Element | null {
  const [type, setType] = useState<SecretType>(() => editingSecret?.type ?? 'password')
  const [showOther, setShowOther] = useState(false)
  const [name, setName] = useState(() => editingSecret?.name ?? '')
  const [value, setValue] = useState(() => editingSecret?.value ?? '')
  const [username, setUsername] = useState(() => editingSecret?.username ?? '')
  const [url] = useState(() => editingSecret?.url ?? '')
  const [notes, setNotes] = useState(() => editingSecret?.notes ?? '')
  const [showValue, setShowValue] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const getPasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) return { label: '', color: '', width: '0%' }
    if (password.length < 6) return { label: 'Weak', color: 'bg-destructive', width: '25%' }
    if (password.length < 10) return { label: 'Fair', color: 'bg-warning', width: '50%' }
    if (password.length < 14) return { label: 'Good', color: 'bg-primary', width: '75%' }
    return { label: 'Strong', color: 'bg-success', width: '100%' }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!value.trim()) newErrors.value = 'Secret value is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!validateForm()) return
    if (editingSecret) {
      await window.vault.editSecret({
        ...editingSecret,
        name,
        type,
        value,
        username,
        url,
        notes
      })
    } else {
      await window.vault.addSecret({
        name,
        type,
        value,
        username,
        url,
        notes
      })
    }
    onSave()
    onClose()
  }

  const strength = type === 'password' ? getPasswordStrength(value) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {editingSecret ? 'Edit Secret' : 'Add New Secret'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {mainSecretTypes.map(({ type: t, label, icon: Icon }) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    if (t === 'other') setShowOther((v) => !v)
                    else {
                      setType(t)
                      setShowOther(false)
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
                    type === t
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Other types grid */}
            {showOther && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {otherSecretTypes.map(({ type: t, label, icon: Icon }) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t)
                      // setShowOther(false)
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
                      type === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Username */}
          {(type === 'password' || type === 'api-key') && (
            <div className="space-y-2">
              <Label>{type === 'api-key' ? 'Key Identifier' : 'Username / Email'}</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          )}

          {/* Secret */}
          <div className="space-y-2">
            <Label>{type === 'note' ? 'Content' : 'Secret'}</Label>
            {type === 'note' || type === 'ssh-key' || type === 'totp' ? (
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`min-h-[120px] font-mono ${errors.value ? 'border-destructive' : ''}`}
              />
            ) : (
              <div className="relative">
                <Input
                  type={showValue ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={`pr-10 font-mono ${errors.value ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowValue((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
            {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
            {strength && strength.label && (
              <div className="space-y-1">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Strength: <span className="font-medium">{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {type !== 'note' && (
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingSecret ? 'Save Changes' : 'Add Secret'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
