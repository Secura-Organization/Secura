import {
  ArrowLeft,
  Clock,
  Clipboard,
  Fingerprint,
  Key,
  Download,
  Shield,
  ChevronRight,
  Info
} from 'lucide-react'
import { Button } from '../components/ui/button/button'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import type { VaultSettings } from '../../../types/vault'

interface SettingsScreenProps {
  settings: VaultSettings
  onSettingsChange: (settings: VaultSettings) => void
  onBack: () => void
}

export function SettingsScreen({ settings, onSettingsChange, onBack }: SettingsScreenProps) {
  const updateSetting = <K extends keyof VaultSettings>(key: K, value: VaultSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* Security Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <Shield size={14} />
              Security
            </div>

            {/* Auto-lock Timeout */}
            <div className="card-elevated rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Clock size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Auto-lock Timeout</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lock vault after period of inactivity
                    </p>
                  </div>
                </div>
                <Select
                  value={String(settings.autoLockTimeout)}
                  onValueChange={(v) => updateSetting('autoLockTimeout', Number(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clipboard Timeout */}
            <div className="card-elevated rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Clipboard size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Clipboard Timeout</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Clear clipboard after copying secrets
                    </p>
                  </div>
                </div>
                <Select
                  value={String(settings.clipboardTimeout)}
                  onValueChange={(v) => updateSetting('clipboardTimeout', Number(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* OS Keychain */}
            <div className="card-elevated rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Fingerprint size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">OS Keychain Integration</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Use system keychain for biometric unlock
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.useOsKeychain}
                  onCheckedChange={(v) => updateSetting('useOsKeychain', v)}
                />
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <Key size={14} />
              Account
            </div>

            {/* Change Master Password */}
            <button className="card-elevated rounded-lg p-4 w-full hover:bg-muted/30 transition-fast">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Key size={18} className="text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium">Change Master Password</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Update your vault encryption key
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </button>

            {/* Export Vault */}
            <button className="card-elevated rounded-lg p-4 w-full hover:bg-muted/30 transition-fast">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Download size={18} className="text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium">Export Vault</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Download encrypted backup file
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </button>
          </section>

          {/* About Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <Info size={14} />
              About
            </div>

            <div className="card-elevated rounded-lg p-5 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Security Model</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Secura uses AES-256-GCM encryption with Argon2id key derivation. Your master
                  password never leaves your device. All data is encrypted locally before being
                  stored. We use PBKDF2 with 100,000 iterations as an additional security layer.
                </p>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Secura v1.0.0</span>
                <span>© 2024</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
