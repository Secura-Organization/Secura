import { ShieldCheck } from 'lucide-react'
import { JSX } from 'react'

export function EmptyDetails(): JSX.Element {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-background p-8 text-center">
      <div className="p-4 bg-muted rounded-full mb-4">
        <ShieldCheck className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg mb-2">No secret selected</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Select a secret from the list to view its details, or add a new one to get started.
      </p>
    </div>
  )
}
