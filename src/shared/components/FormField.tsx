import type { ReactNode } from 'react'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/lib/utils'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  className?: string
  children: ReactNode
}

/** Label + controlo + ajuda + erro, com ids consistentes para leitores de ecrã. */
export function FormField({ id, label, error, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
