import type { BookingStatus } from '@/shared/contract/types'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'

const STATUS_LABEL: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === 'CONFIRMED'
          ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          : 'border-zinc-400/40 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  )
}
