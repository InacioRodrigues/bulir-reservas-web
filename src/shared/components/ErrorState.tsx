import { AlertTriangle, RotateCw } from 'lucide-react'
import { getErrorMessage } from '@/shared/api/errors'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle aria-hidden="true" />
      <AlertTitle>Não foi possível carregar os dados</AlertTitle>
      <AlertDescription>
        <p>{getErrorMessage(error)}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            <RotateCw /> Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
