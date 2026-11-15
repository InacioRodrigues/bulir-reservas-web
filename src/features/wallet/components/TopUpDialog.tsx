import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PlusCircle } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { applyFieldErrors, getErrorMessage } from '@/shared/api/errors'
import { fieldA11y } from '@/shared/components/field-a11y'
import { FormField } from '@/shared/components/FormField'
import { topUpSchema, type TopUpInput, type TopUpValues } from '@/shared/contract/schemas'
import { formatKz } from '@/shared/lib/money'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { useTopUp } from '../hooks'

const QUICK_AMOUNTS = ['5000', '10000', '25000', '50000']

/** Carregamento de saldo (só clientes — a API devolve 403 a prestadores). */
export function TopUpDialog({
  trigger,
  suggestedAmount,
}: {
  trigger: ReactNode
  /** Ex.: o valor em falta para contratar um serviço. */
  suggestedAmount?: string
}) {
  const [open, setOpen] = useState(false)
  const topUp = useTopUp()
  const form = useForm<TopUpInput, unknown, TopUpValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: { amount: '' },
  })
  const { errors, isSubmitting } = form.formState

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) form.reset({ amount: suggestedAmount ? suggestedAmount.replace('.', ',') : '' })
  }

  const submit = form.handleSubmit(async ({ amount }) => {
    try {
      const { balance } = await topUp.mutateAsync(amount)
      toast.success(`Saldo carregado. Novo saldo: ${formatKz(balance)}`)
      setOpen(false)
    } catch (error) {
      if (!applyFieldErrors(error, form.setError, ['amount'] as const)) {
        form.setError('root', { message: getErrorMessage(error) })
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Carregar saldo</DialogTitle>
            <DialogDescription>
              Simulação de carregamento da carteira (até 1 000 000 Kz por operação).
            </DialogDescription>
          </DialogHeader>
          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}
          <FormField id="topup-amount" label="Valor (Kz)" error={errors.amount?.message}>
            <Input
              {...fieldA11y('topup-amount', errors.amount?.message)}
              {...form.register('amount')}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0,00"
              className="h-10 tabular-nums"
            />
          </FormField>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Valores rápidos</legend>
            {QUICK_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue('amount', amount, { shouldValidate: true })}
              >
                {formatKz(amount).replace(',00', '')}
              </Button>
            ))}
          </fieldset>
          <DialogFooter>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle />}
              Carregar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
