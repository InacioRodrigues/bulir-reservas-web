import { ArrowDownLeft, ArrowUpRight, PlusCircle, RotateCcw, type LucideIcon } from 'lucide-react'
import { Amount } from '@/shared/components/Amount'
import type { Transaction, TransactionType } from '@/shared/contract/types'
import { formatDateTime } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const TYPE_INFO: Record<TransactionType, { label: string; icon: LucideIcon }> = {
  TOP_UP: { label: 'Carregamento de saldo', icon: PlusCircle },
  BOOKING_DEBIT: { label: 'Pagamento de reserva', icon: ArrowUpRight },
  BOOKING_CREDIT: { label: 'Recebimento de reserva', icon: ArrowDownLeft },
  REFUND_CREDIT: { label: 'Reembolso recebido', icon: RotateCcw },
  REFUND_DEBIT: { label: 'Reembolso devolvido', icon: RotateCcw },
}

function TypeCell({ transaction }: { transaction: Transaction }) {
  const { label, icon: Icon } = TYPE_INFO[transaction.type]
  const credit = !transaction.amount.startsWith('-')
  return (
    <span className="flex items-center gap-3">
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full',
          credit
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="grid">
        <span className="font-medium">{label}</span>
        {transaction.bookingId && (
          <span className="text-xs text-muted-foreground">
            Reserva #{transaction.bookingId.slice(0, 8)}
          </span>
        )}
      </span>
    </span>
  )
}

/** Extrato da carteira (ledger): o valor já vem com sinal da API. */
export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movimento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Saldo após</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <TypeCell transaction={transaction} />
                </TableCell>
                <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Amount value={transaction.amount} signed />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  <Amount value={transaction.balanceAfter} className="font-normal" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y rounded-xl border bg-card md:hidden">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="flex items-center justify-between gap-3 p-3">
            <div className="grid gap-1">
              <TypeCell transaction={transaction} />
              <span className="pl-11 text-xs text-muted-foreground">
                {formatDateTime(transaction.createdAt)}
              </span>
            </div>
            <div className="grid text-right">
              <Amount value={transaction.amount} signed />
              <span className="text-xs text-muted-foreground">
                Saldo <Amount value={transaction.balanceAfter} className="font-normal" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
