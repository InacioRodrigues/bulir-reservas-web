import { useState } from 'react'
import { CalendarX2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { useCurrentUser } from '@/features/auth/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { paths } from '@/shared/config/paths'
import type { Booking, BookingStatus } from '@/shared/contract/types'
import { usePageParam } from '@/shared/hooks/usePageParam'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { BookingList, BookingListSkeleton } from '../components/BookingList'
import { CancelBookingDialog } from '../components/CancelBookingDialog'
import { useBookings } from '../hooks'

const PER_PAGE = 10
type StatusFilter = 'ALL' | BookingStatus

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

export function BookingsPage() {
  const user = useCurrentUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = usePageParam()
  const rawStatus = searchParams.get('status')
  const status: StatusFilter =
    rawStatus === 'CONFIRMED' || rawStatus === 'CANCELLED' ? rawStatus : 'ALL'
  const [toCancel, setToCancel] = useState<Booking | null>(null)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useBookings({
    page,
    perPage: PER_PAGE,
    status: status === 'ALL' ? undefined : status,
  })

  const changeStatus = (next: string) =>
    setSearchParams((params) => {
      params.delete('page')
      if (next === 'ALL') params.delete('status')
      else params.set('status', next)
      return params
    })

  return (
    <>
      <PageHeader
        title="Histórico de reservas"
        description={
          user.role === 'CLIENT'
            ? 'Serviços que contratou: prestador, valor pago e estado.'
            : 'Contratações dos seus serviços: cliente, valor recebido e estado.'
        }
      />

      <Tabs value={status} onValueChange={changeStatus} className="mb-4">
        <TabsList aria-label="Filtrar por estado">
          {FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <BookingListSkeleton />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title={status === 'ALL' ? 'Ainda não há reservas' : 'Sem reservas neste estado'}
          description={
            user.role === 'CLIENT'
              ? 'Quando contratar um serviço, ele aparece aqui.'
              : 'Quando um cliente contratar um dos seus serviços, aparece aqui.'
          }
          action={
            user.role === 'CLIENT' && status === 'ALL' ? (
              <Button asChild>
                <Link to={paths.catalog}>Explorar serviços</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div aria-busy={isPlaceholderData || undefined}>
          <BookingList bookings={data.items} currentUser={user} onCancel={setToCancel} />
          <PaginationControls
            meta={data.meta}
            onPageChange={setPage}
            disabled={isPlaceholderData}
          />
        </div>
      )}

      <CancelBookingDialog booking={toCancel} onOpenChange={(open) => !open && setToCancel(null)} />
    </>
  )
}
