import { Loader2 } from 'lucide-react'

export function FullPageSpinner({ label = 'A carregar…' }: { label?: string }) {
  return (
    <output className="grid min-h-[50svh] place-items-center text-muted-foreground">
      <span className="inline-flex items-center gap-2 text-sm">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" /> {label}
      </span>
    </output>
  )
}
