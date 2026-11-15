import { toast } from 'sonner'
import type { Service } from '@/shared/contract/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import type { ServicePayload } from '../api'
import { useCreateService, useUpdateService } from '../hooks'
import { ServiceForm } from './ServiceForm'

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Presente = editar; ausente = criar. */
  service?: Service
}

export function ServiceFormDialog({ open, onOpenChange, service }: ServiceFormDialogProps) {
  const createService = useCreateService()
  const updateService = useUpdateService()
  const editing = Boolean(service)

  const handleSubmit = async (payload: Partial<ServicePayload>) => {
    if (service) {
      await updateService.mutateAsync({ id: service.id, payload })
      toast.success('Serviço atualizado.')
    } else {
      await createService.mutateAsync(payload as ServicePayload)
      toast.success('Serviço criado e já visível no catálogo.')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar serviço' : 'Novo serviço'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'As alterações não afetam reservas já feitas (o preço pago fica registado).'
              : 'Os clientes verão este serviço no catálogo assim que o criar.'}
          </DialogDescription>
        </DialogHeader>
        {/* key: reinicia o formulário ao trocar de serviço */}
        <ServiceForm
          key={service?.id ?? 'new'}
          service={service}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={editing ? 'Guardar alterações' : 'Criar serviço'}
        />
      </DialogContent>
    </Dialog>
  )
}
