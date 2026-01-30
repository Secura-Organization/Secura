import { useState, useEffect, JSX } from 'react'
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Pencil,
  Trash2,
  ExternalLink,
  Clock,
  AlertTriangle,
  Shield
} from 'lucide-react'
import { Button } from '../components/ui/button/button'
import { SecretTypeIcon } from './SecretTypeIcon'
import { getSecretTypeLabel } from '../utils/secretTypes'
import type { Secret } from '../../../types/vault'
import { format } from 'date-fns'
import { useSettingsStore } from '../stores/settingsStore'

interface SecretDetailsProps {
  secret: Secret
  onEdit: () => void
  onDelete: () => void
}

export function SecretDetails({ secret, onEdit, onDelete }: SecretDetailsProps): JSX.Element {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [clipboardWarning, setClipboardWarning] = useState(false)

  const clipboardSeconds = useSettingsStore((state) => state.clipboardSeconds)
  const [countdown, setCountdown] = useState(clipboardSeconds)

  // Clipboard countdown timer
  useEffect(() => {
    if (!clipboardWarning) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setClipboardWarning(false)
          return clipboardSeconds
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [clipboardWarning, clipboardSeconds])

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(secret.value)
    setTimeout(async () => await navigator.clipboard.writeText(''), clipboardSeconds * 1000)
    setCopied(true)
    setClipboardWarning(true)
    setCountdown(clipboardSeconds)

    setTimeout(() => setCopied(false), 2000)
  }

  const handleReveal = (): void => {
    setRevealed(!revealed)
  }

  const maskValue = (value: string): string => {
    return '•'.repeat(Math.min(value.length, 24))
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted rounded-xl">
              <SecretTypeIcon type={secret.type} size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{secret.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {getSecretTypeLabel(secret.type)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await window.vault.deleteSecret(secret.id)
                onDelete()
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {clipboardWarning && (
          <div className="warning-badge w-full justify-center py-2 animate-fade-in">
            <AlertTriangle size={14} />
            <span>Clipboard will clear in {countdown} seconds</span>
          </div>
        )}

        {/* Username/Login (if applicable) */}
        {secret.username && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {secret.type === 'api-key' ? 'Key Identifier' : 'Username / Email'}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 secret-field">{secret.username}</div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={async () => {
                  await navigator.clipboard.writeText(secret.username!)
                  setTimeout(
                    async () => await navigator.clipboard.writeText(''),
                    clipboardSeconds * 1000
                  )
                  setCopied(true)
                  setClipboardWarning(true)
                  setCountdown(clipboardSeconds)

                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Secret Value */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            {secret.type === 'note'
              ? 'Content'
              : secret.type === 'ssh-key'
                ? 'Private Key'
                : 'Secret'}
          </label>
          <div className="flex items-start gap-2">
            <div
              className={`flex-1 secret-field ${secret.type === 'note' || secret.type === 'ssh-key' ? 'min-h-[100px] whitespace-pre-wrap' : ''}`}
            >
              {revealed ? (
                <span className="break-all">{secret.value}</span>
              ) : (
                <span className="secret-masked">{maskValue(secret.value)}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="shrink-0" onClick={handleReveal}>
                {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={handleCopy}>
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
        </div>

        {/* URL (if applicable) */}
        {secret.url && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Website</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 secret-field text-primary">{secret.url}</div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => window.open(secret.url, '_blank')}
              >
                <ExternalLink size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Notes */}
        {secret.notes && secret.type !== 'note' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Notes</label>
            <div className="secret-field min-h-[60px] whitespace-pre-wrap text-muted-foreground">
              {secret.notes}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shield size={14} />
            Security Info
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="font-medium mt-0.5">{format(secret.createdAt, 'MMM d, yyyy')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Accessed</span>
              <p className="font-medium mt-0.5 flex items-center gap-1">
                <Clock size={12} className="text-muted-foreground" />
                {format(secret.lastAccessed, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
