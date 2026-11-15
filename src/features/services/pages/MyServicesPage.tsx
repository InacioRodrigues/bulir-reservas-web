import { useState } from 'react'
import { BriefcaseBusiness, Pencil, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { PaginationControls } from '@/shared/components/PaginationControls'
import type { Service } from '@/shared/contract/types'
import { usePageParam } from '@/shared/hooks/usePageParam'
import { Button } from '@/shared/ui/button'
import { DeleteServiceDialog } from '../components/DeleteServiceDialog'
import { ServiceCard, ServiceCardSkeleton, ServiceGrid } from '../components/ServiceCard'
import { ServiceFormDialog } from '../components/ServiceFormDialog'
import { SERVICES_PER_PAGE, useMyServices } from '../hooks'

/** `service` mantém-se ao fechar para o diálogo não mudar de título durante a animação. */
interface FormState {
  open: boolean
  service?: Service
}

export function MyServicesPage() {
  const [page, setPage] = usePageParam()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useMyServices({
    page,
    perPage: SERVICES_PER_PAGE,
  })
  const [formState, setFormState] = useState<FormState>({ open: false })
  const [toDelete, setToDelete] = useState<Service | null>(null)

  const openCreate = () => setFormState({ open: true })
  const total = data?.meta.total

  return (
    <>
      <PageHeader
        title="Meus serviços"
        description={
          total === undefined
            ? 'Crie e gira os serviços que os clientes podem contratar.'
            : `${total} ${total === 1 ? 'serviço publicado' : 'serviços publicados'}.`
        }
        actions={
          <Button size="lg" onClick={openCreate}>
            <Plus /> Novo serviço
          </Button>
        }
      />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <ServiceGrid busy>
          {Array.from({ length: 6 }, (_, index) => (
            <ServiceCardSkeleton key={index} />
          ))}
        </ServiceGrid>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Ainda não publicou serviços"
          description="Crie o seu primeiro serviço com título, descrição e preço. Fica logo visível para os clientes."
          action={
            <Button onClick={openCreate}>
              <Plus /> Criar primeiro serviço
            </Button>
          }
        />
      ) : (
        <>
          <ServiceGrid busy={isPlaceholderData}>
            {data.items.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                actions={
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFormState({ open: true, service })}
                      aria-label={`Editar ${service.name}`}
                    >
                      <Pencil /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setToDelete(service)}
                      aria-label={`Excluir ${service.name}`}
                    >
                      <Trash2 /> Excluir
                    </Button>
                  </>
                }
              />
            ))}
          </ServiceGrid>
          <PaginationControls
            meta={data.meta}
            onPageChange={setPage}
            disabled={isPlaceholderData}
          />
        </>
      )}

      <ServiceFormDialog
        open={formState.open}
        service={formState.service}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
      />
      <DeleteServiceDialog
        service={toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        onDeleted={() => {
          // Se era o último item da página, recua uma página.
          if (data && data.items.length === 1 && page > 1) setPage(page - 1)
        }}
      />
    </>
  )
}
