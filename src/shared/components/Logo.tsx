import { cn } from '@/shared/lib/utils'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-teal-400" />
        <path
          d="M10 8h7a5 5 0 0 1 2.6 9.3A5.5 5.5 0 0 1 17.5 26H10z"
          fill="none"
          stroke="#0f1d3a"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span className="text-lg">
          Bulir <span className="font-normal text-muted-foreground">Reservas</span>
        </span>
      )}
    </span>
  )
}
