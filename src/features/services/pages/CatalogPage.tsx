import { useState } from 'react'
import { CalendarCheck, SearchX, Store, Wallet } from 'lucide-react'
import { useMe } from '@/features/auth/hooks'
import { BookServiceDialog } from '@/features/bookings/components/BookServiceDialog'
import { TopUpDialog } from '@/features/wallet/components/TopUpDialog'
import { Amount } from '@/shared/components/Amount'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { PaginationControls } from '@/shared/components/PaginationControls'
import type { Service } from '@/shared/contract/types'
import { hasSufficientBalance, subtractMoney } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { toListParams, useCatalogFilters } from '../catalog-filters'
import { CatalogFiltersBar } from '../components/CatalogFiltersBar'
import { ServiceCard, ServiceCardSkeleton, ServiceGrid } from '../components/ServiceCard'
import { SERVICES_PER_PAGE, useCatalog } from '../hooks'

export function CatalogPage() {
  const { filters, update, reset, active } = useCatalogFilters()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useCatalog(
    toListParams(filters, SERVICES_PER_PAGE),
  )
  const { data: user } = useMe()
  const [toBook, setToBook] = useState<Service | null>(null)
  const balance = user?.balance ?? '0.00'

  return (
    <>
      <PageHeader
        title="Serviços disponíveis"
        description="Escolha um serviço e contrate-o com o saldo da sua carteira."
        actions={
          <TopUpDialog
            trigger={
              <Button variant="outline" size="lg">
                <Wallet /> Carregar saldo
              </Button>
            }
          />
        }
      />

      <CatalogFiltersBar filters={filters} onChange={update} onReset={reset} active={active} />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <ServiceGrid busy>
          {Array.from({ length: 6 }, (_, index) => (
            <ServiceCardSkeleton key={index} />
          ))}
        </ServiceGrid>
      ) : data.items.length === 0 ? (
        active ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum serviço corresponde à pesquisa"
            description="Experimente outras palavras ou alargue o intervalo de preço."
            action={
              <Button variant="outline" onClick={reset}>
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Store}
            title="Ainda não há serviços publicados"
            description="Volte mais tarde: os prestadores estão a preparar as suas ofertas."
          />
        )
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
            {data.meta.total}{' '}
            {data.meta.total === 1 ? 'serviço encontrado' : 'serviços encontrados'}
          </p>
          <ServiceGrid busy={isPlaceholderData}>
            {data.items.map((service) => {
              const affordable = hasSufficientBalance(balance, service.price)
              const hintId = `service-${service.id}-balance`
              return (
                <ServiceCard
                  key={service.id}
                  service={service}
                  showProvider
                  actions={
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        onClick={() => setToBook(service)}
                        disabled={!affordable}
                        aria-describedby={affordable ? undefined : hintId}
                        aria-label={`Contratar ${service.name}`}
                      >
                        <CalendarCheck /> Contratar
                      </Button>
                      {!affordable && (
                        <p id={hintId} className="text-xs text-destructive">
                          Saldo insuficiente · faltam{' '}
                          <Amount value={subtractMoney(service.price, balance)} />
                        </p>
                      )}
                    </div>
                  }
                />
              )
            })}
          </ServiceGrid>
          <PaginationControls
            meta={data.meta}
            onPageChange={(page) => {
              update({ page })
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            disabled={isPlaceholderData}
          />
        </>
      )}

      <BookServiceDialog service={toBook} onOpenChange={(open) => !open && setToBook(null)} />
    </>
  )
}
