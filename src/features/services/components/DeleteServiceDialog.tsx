import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/errors'
import type { Service } from '@/shared/contract/types'
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
import { useDeleteService } from '../hooks'

interface DeleteServiceDialogProps {
  service: Service | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteServiceDialog({
  service,
  onOpenChange,
  onDeleted,
}: DeleteServiceDialogProps) {
  const deleteService = useDeleteService()

  const confirm = async () => {
    if (!service) return
    try {
      await deleteService.mutateAsync(service.id)
      toast.success(`"${service.name}" foi excluído.`)
      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AlertDialog open={Boolean(service)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir “{service?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            O serviço deixa de aparecer no catálogo. As reservas já feitas e o histórico mantêm-se.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteService.isPending}>Cancelar</AlertDialogCancel>
          {/* Botão normal (não AlertDialogAction) para o diálogo só fechar depois da API responder */}
          <Button variant="destructive" onClick={confirm} disabled={deleteService.isPending}>
            {deleteService.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Excluir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
