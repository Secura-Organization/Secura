import { JSX, useState } from 'react'
import { Eye, EyeOff, Lock, AlertCircle, Import } from 'lucide-react'
import { Button } from '../components/ui/button/button'
import { Input } from '../components/ui/input'
import { VaultLogo } from '../components/VaultLogo'
import { useNavigate } from 'react-router-dom'
import { useMasterPasswordStore } from '../stores/masterPasswordStore'
import { useSettingsStore } from '../stores/settingsStore'

export function UnlockScreen(): JSX.Element {
  //use dark mode
  document.documentElement.classList.add('dark')

  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState('')
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showImportSuccess, setShowImportSuccess] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await window.vault.unlock(password)

    if (!result.success) {
      if (result.waitTime) {
        let remaining = Math.ceil(result.waitTime / 1000)

        const interval = setInterval(() => {
          remaining -= 1
          if (remaining <= 0) {
            clearInterval(interval)
            setIsCountingDown(false)
            setError('You can try again now.')
          } else {
            setIsCountingDown(true)
            setError(`Too many attempts. Try again in ${remaining}s`)
          }
        }, 1000)
      } else {
        setError('Wrong password')
      }
    } else {
      useMasterPasswordStore.getState().setUnlocked(true)
      navigate('/vault')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <VaultLogo size="lg" />
        </div>

        {/* Unlock Card */}
        <div className="card-elevated rounded-xl p-6 space-y-6">
          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className={`p-4 rounded-full bg-muted ${error ? 'animate-shake' : ''}`}>
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Master Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  className="input-secure pr-10 h-11"
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive animate-fade-in">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Unlock Button */}
            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={!password || isLoading || isCountingDown}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Unlocking...</span>
                </div>
              ) : (
                'Unlock Vault'
              )}
            </Button>
          </form>

          {/* Import Vault Button */}
          <div className="flex items-center justify-center">
            <button
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-muted"
              onClick={async () => {
                try {
                  const success = await window.vault.importVault()
                  if (success) {
                    setShowImportSuccess(true)
                    setTimeout(() => setShowImportSuccess(false), 2000)
                  }
                } catch {
                  return
                }
              }}
            >
              <Import size={18} />
              <span>Import Vault</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your vault is encrypted locally.
            <br />
            Nothing leaves your device.
          </p>
        </div>

        {/* Auto-lock Indicator */}
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Lock size={12} />
            <span>
              Auto-locks after {useSettingsStore.getState().autoLockMinutes} minutes of inactivity
            </span>
          </div>
        </div>
      </div>

      {showImportSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background card-elevated rounded-lg p-6 w-96 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-green-500/10">
                <Import className="text-green-500" size={28} />
              </div>
            </div>

            <h2 className="text-lg font-semibold">Import Successful</h2>

            <p className="text-sm text-muted-foreground">Your vault was imported successfully.</p>

            <div className="flex justify-center pt-2">
              <Button onClick={() => setShowImportSuccess(false)}>OK</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
