import type { Money } from '@/shared/contract/types'
import { formatKz, toCents } from '@/shared/lib/money'
import { cn } from '@/shared/lib/utils'

/** Valor em Kz com algarismos tabulares; `signed` colore créditos/débitos. */
export function Amount({
  value,
  signed = false,
  className,
}: {
  value: Money
  signed?: boolean
  className?: string
}) {
  const cents = toCents(value)
  return (
    <span
      className={cn(
        'font-medium whitespace-nowrap tabular-nums',
        signed && cents > 0n && 'text-emerald-700 dark:text-emerald-400',
        signed && cents < 0n && 'text-red-700 dark:text-red-400',
        className,
      )}
    >
      {formatKz(value, { signed })}
    </span>
  )
}
