import { CalendarCheck, Loader2, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/features/auth/hooks'
import { TopUpDialog } from '@/features/wallet/components/TopUpDialog'
import { getErrorMessage, toApiError } from '@/shared/api/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { Amount } from '@/shared/components/Amount'
import { paths } from '@/shared/config/paths'
import type { Service } from '@/shared/contract/types'
import { hasSufficientBalance, subtractMoney } from '@/shared/lib/money'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Separator } from '@/shared/ui/separator'
import { useCreateBooking } from '../hooks'

interface BookServiceDialogProps {
  service: Service | null
  onOpenChange: (open: boolean) => void
}

/**
 * Confirmação da contratação: mostra saldo atual → saldo após. A verificação de saldo aqui
 * é UX (evita um pedido condenado); a API é a autoridade e responde 409
 * INSUFFICIENT_BALANCE se, entretanto, o saldo mudou (ex.: outra aba).
 */
export function BookServiceDialog({ service, onOpenChange }: BookServiceDialogProps) {
  const { data: user } = useMe()
  const createBooking = useCreateBooking()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const balance = user?.balance ?? '0.00'
  const sufficient = service ? hasSufficientBalance(balance, service.price) : false
  const after = service ? subtractMoney(balance, service.price) : '0.00'
  const missing = service && !sufficient ? subtractMoney(service.price, balance) : null

  const handleOpenChange = (open: boolean) => {
    if (!open) createBooking.reset()
    onOpenChange(open)
  }

  const confirm = async () => {
    if (!service) return
    try {
      const booking = await createBooking.mutateAsync(service.id)
      toast.success(`Reserva de "${booking.service.name}" confirmada.`, {
        action: { label: 'Ver reservas', onClick: () => navigate(paths.bookings) },
      })
      handleOpenChange(false)
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.is('NOT_FOUND')) {
        toast.error('Este serviço já não está disponível.')
        void queryClient.invalidateQueries({ queryKey: queryKeys.services.all })
        handleOpenChange(false)
      }
    }
  }

  const apiError = createBooking.error ? toApiError(createBooking.error) : null

  return (
    <Dialog open={Boolean(service)} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contratar serviço</DialogTitle>
          <DialogDescription>
            O valor é debitado do seu saldo e creditado ao prestador de imediato.
          </DialogDescription>
        </DialogHeader>

        {service && (
          <dl className="grid gap-2 rounded-lg border bg-muted/40 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Serviço</dt>
              <dd className="text-right font-medium">{service.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Prestador</dt>
              <dd className="text-right">{service.provider.fullName}</dd>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Saldo atual</dt>
              <dd>
                <Amount value={balance} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Preço</dt>
              <dd>
                <Amount value={`-${service.price}`} signed />
              </dd>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between gap-4 text-base">
              <dt className="font-medium">Saldo após</dt>
              <dd>
                <Amount value={after} className={sufficient ? '' : 'text-destructive'} />
              </dd>
            </div>
          </dl>
        )}

        {missing && (
          <Alert variant="destructive" id="booking-insufficient">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>Saldo insuficiente</AlertTitle>
            <AlertDescription>
              Faltam <Amount value={missing} /> para contratar este serviço.
            </AlertDescription>
          </Alert>
        )}

        {apiError && !apiError.is('NOT_FOUND') && (
          <Alert variant="destructive" aria-live="assertive">
            <AlertDescription>{getErrorMessage(apiError)}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" size="lg" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          {missing ? (
            <TopUpDialog
              suggestedAmount={missing}
              trigger={<Button size="lg">Carregar saldo</Button>}
            />
          ) : (
            <Button
              size="lg"
              onClick={confirm}
              disabled={!sufficient || createBooking.isPending}
              aria-describedby={sufficient ? undefined : 'booking-insufficient'}
            >
              {createBooking.isPending ? <Loader2 className="animate-spin" /> : <CalendarCheck />}
              Confirmar contratação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
