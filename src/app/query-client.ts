import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage, toApiError } from '@/shared/api/errors'

/** Avisa uma única vez quando o refresh falha e a sessão termina. */
function notifySessionExpired(error: unknown) {
  if (toApiError(error).is('SESSION_EXPIRED')) {
    toast.error(getErrorMessage(error), { id: 'session-expired' })
  }
}

/**
 * Estado do SERVIDOR (serviços, reservas, saldo) vive aqui, não em stores globais.
 * - Não repetimos erros 4xx (são determinísticos: repetir só gasta rate limit).
 * - Repetimos até 2x erros de rede/5xx.
 */
export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: notifySessionExpired }),
    mutationCache: new MutationCache({ onError: notifySessionExpired }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          const { status } = toApiError(error)
          if (status >= 400 && status < 500) return false
          return failureCount < 2
        },
      },
      mutations: { retry: false },
    },
  })
}

export const queryClient = createQueryClient()
