import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/shared/components/EmptyState'
import { paths } from '@/shared/config/paths'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  useDocumentTitle('Página não encontrada')
  return (
    <div className="mx-auto grid min-h-[60svh] max-w-lg place-items-center p-4">
      <EmptyState
        icon={Compass}
        title="Página não encontrada"
        description="O endereço que abriu não existe ou foi movido."
        action={
          <Button asChild>
            <Link to={paths.home}>Voltar ao início</Link>
          </Button>
        }
      />
    </div>
  )
}
