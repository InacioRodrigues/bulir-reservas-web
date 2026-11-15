import { Wallet } from 'lucide-react'
import { Link } from 'react-router'
import { useMe } from '@/features/auth/hooks'
import { Amount } from '@/shared/components/Amount'
import { paths } from '@/shared/config/paths'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

/** Saldo atual (vem de GET /auth/me; nunca é calculado no cliente). */
export function BalanceBadge({ className }: { className?: string }) {
  const { data: user, isFetching } = useMe()
  if (!user) return <Skeleton className="h-8 w-28" />
  return (
    <Link
      to={paths.wallet}
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-lg border bg-accent/50 px-2.5 text-sm transition-colors hover:bg-accent',
        className,
      )}
      aria-label={`Saldo atual. Abrir carteira`}
      aria-busy={isFetching}
    >
      <Wallet className="size-4 text-primary" aria-hidden="true" />
      <Amount value={user.balance} />
    </Link>
  )
}
