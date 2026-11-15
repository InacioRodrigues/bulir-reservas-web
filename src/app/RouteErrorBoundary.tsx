import { AlertOctagon } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/ui/button'
import { NotFoundPage } from './NotFoundPage'

/** Apanha erros de renderização/carregamento de rotas para a app nunca ficar em branco. */
export function RouteErrorBoundary() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />
  console.error(error)
  return (
    <div className="mx-auto grid min-h-[60svh] max-w-lg place-items-center p-4">
      <EmptyState
        icon={AlertOctagon}
        title="Algo correu mal"
        description="Ocorreu um erro inesperado. Recarregue a página para tentar novamente."
        action={<Button onClick={() => window.location.reload()}>Recarregar</Button>}
      />
    </div>
  )
}
