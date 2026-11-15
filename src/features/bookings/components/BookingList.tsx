import { Undo2 } from 'lucide-react'
import { Amount } from '@/shared/components/Amount'
import type { Booking, PersonRef, User } from '@/shared/contract/types'
import { formatDateTime } from '@/shared/lib/date'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { BookingStatusBadge } from './BookingStatusBadge'

interface BookingListProps {
  bookings: Booking[]
  currentUser: User
  onCancel: (booking: Booking) => void
}

function Person({ person, currentUser }: { person: PersonRef; currentUser: User }) {
  const isMe = person.id === currentUser.id
  return (
    <span className={isMe ? 'font-medium' : undefined}>
      {person.fullName}
      {isMe && <span className="text-muted-foreground"> (você)</span>}
    </span>
  )
}

function CancelledNote({ booking }: { booking: Booking }) {
  if (!booking.cancelledAt) return null
  const by = booking.cancelledBy === 'CLIENT' ? 'pelo cliente' : 'pelo prestador'
  return (
    <span className="block text-xs text-muted-foreground">
      Cancelada {by} a {formatDateTime(booking.cancelledAt)}
    </span>
  )
}

function CancelButton({ booking, onCancel }: { booking: Booking; onCancel: (b: Booking) => void }) {
  if (booking.status !== 'CONFIRMED') return null
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onCancel(booking)}
      aria-label={`Cancelar reserva de ${booking.service.name}`}
    >
      <Undo2 /> Cancelar
    </Button>
  )
}

/** Tabela em ecrãs largos, cartões em mobile — o mesmo dado, dois layouts. */
export function BookingList({ bookings, currentUser, onCancel }: BookingListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Prestador</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="max-w-56 font-medium whitespace-normal">
                  {booking.service.name}
                </TableCell>
                <TableCell>
                  <Person person={booking.provider} currentUser={currentUser} />
                </TableCell>
                <TableCell>
                  <Person person={booking.client} currentUser={currentUser} />
                </TableCell>
                <TableCell className="text-right">
                  <Amount
                    value={booking.price}
                    className={
                      booking.status === 'CANCELLED' ? 'text-muted-foreground line-through' : ''
                    }
                  />
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="whitespace-normal">
                  {formatDateTime(booking.createdAt)}
                  <CancelledNote booking={booking} />
                </TableCell>
                <TableCell className="text-right">
                  <CancelButton booking={booking} onCancel={onCancel} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Card size="sm">
              <CardContent className="grid gap-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium">{booking.service.name}</h3>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Prestador</dt>
                  <dd>
                    <Person person={booking.provider} currentUser={currentUser} />
                  </dd>
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd>
                    <Person person={booking.client} currentUser={currentUser} />
                  </dd>
                  <dt className="text-muted-foreground">Data</dt>
                  <dd>
                    {formatDateTime(booking.createdAt)}
                    <CancelledNote booking={booking} />
                  </dd>
                </dl>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Amount
                    value={booking.price}
                    className={
                      booking.status === 'CANCELLED'
                        ? 'text-base text-muted-foreground line-through'
                        : 'text-base'
                    }
                  />
                  <CancelButton booking={booking} onCancel={onCancel} />
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </>
  )
}

export function BookingListSkeleton() {
  return (
    <div className="grid gap-3" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}
