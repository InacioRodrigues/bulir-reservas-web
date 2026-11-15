import { PlusCircle, ReceiptText, Wallet } from 'lucide-react'
import { useCurrentUser } from '@/features/auth/hooks'
import { Amount } from '@/shared/components/Amount'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { usePageParam } from '@/shared/hooks/usePageParam'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { TopUpDialog } from '../components/TopUpDialog'
import { TransactionList } from '../components/TransactionList'
import { useTransactions } from '../hooks'

const PER_PAGE = 15

export function WalletPage() {
  const user = useCurrentUser()
  const [page, setPage] = usePageParam()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useTransactions({
    page,
    perPage: PER_PAGE,
  })

  return (
    <>
      <PageHeader title="Carteira" description="Saldo atual e todos os movimentos da sua conta." />

      <Card className="mb-6 bg-[#0f1d3a] text-white ring-0">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-teal-400/20">
              <Wallet className="size-5 text-teal-300" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-slate-300">Saldo disponível</p>
              <Amount value={user.balance} className="text-3xl font-semibold" />
            </div>
          </div>
          {user.role === 'CLIENT' ? (
            <TopUpDialog
              trigger={
                <Button size="lg" className="bg-teal-400 text-[#0f1d3a] hover:bg-teal-300">
                  <PlusCircle /> Carregar saldo
                </Button>
              }
            />
          ) : (
            <p className="max-w-xs text-sm text-slate-300">
              Recebe o valor de cada reserva no momento da contratação.
            </p>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Movimentos</h2>
      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="grid gap-2" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Sem movimentos"
          description="Carregamentos, pagamentos, recebimentos e reembolsos aparecem aqui."
        />
      ) : (
        <div aria-busy={isPlaceholderData || undefined}>
          <TransactionList transactions={data.items} />
          <PaginationControls
            meta={data.meta}
            onPageChange={setPage}
            disabled={isPlaceholderData}
          />
        </div>
      )}
    </>
  )
}
