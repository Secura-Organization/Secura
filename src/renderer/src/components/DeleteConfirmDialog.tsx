import { AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/button/button'
import type { Secret } from '../../../types/vault'
import { JSX } from 'react'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  secret: Secret | null
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({
  isOpen,
  secret,
  onConfirm,
  onCancel
}: DeleteConfirmDialogProps): JSX.Element {
  if (!isOpen || !secret) return <></>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-xl shadow-xl animate-slide-up p-6">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-destructive/10 rounded-full mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Delete Secret</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">&quot;{secret.name}&quot;</span>? This
            action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={onConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
