import { Loader2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/features/auth/hooks'
import { getErrorMessage, toApiError } from '@/shared/api/errors'
import { Amount } from '@/shared/components/Amount'
import type { Booking } from '@/shared/contract/types'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { useCancelBooking } from '../hooks'

export function CancelBookingDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null
  onOpenChange: (open: boolean) => void
}) {
  const user = useCurrentUser()
  const cancelBooking = useCancelBooking()
  const isClient = user.role === 'CLIENT'

  const confirm = async () => {
    if (!booking) return
    try {
      await cancelBooking.mutateAsync(booking.id)
      toast.success('Reserva cancelada e valor reembolsado ao cliente.')
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
      // Já cancelada noutro lado: a lista é refeita pela invalidação; fechamos o diálogo.
      if (toApiError(error).is('BOOKING_ALREADY_CANCELLED')) onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={Boolean(booking)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar a reserva de “{booking?.service.name}”?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {booking && (
                <p>
                  {isClient ? (
                    <>
                      Recebe de volta <Amount value={booking.price} /> na sua carteira. O valor é
                      debitado a {booking.provider.fullName}.
                    </>
                  ) : (
                    <>
                      <Amount value={booking.price} /> será debitado do seu saldo e devolvido a{' '}
                      {booking.client.fullName}.
                    </>
                  )}
                </p>
              )}
              <p>Esta ação não pode ser anulada.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelBooking.isPending}>Manter reserva</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={cancelBooking.isPending}>
            {cancelBooking.isPending ? <Loader2 className="animate-spin" /> : <Undo2 />}
            Cancelar reserva
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
