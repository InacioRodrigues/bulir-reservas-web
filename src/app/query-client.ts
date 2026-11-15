import { QueryClient } from '@tanstack/react-query'
import { toApiError } from '@/shared/api/errors'

/**
 * Estado do SERVIDOR (serviços, reservas, saldo) vive aqui, não em stores globais.
 * - Não repetimos erros 4xx (são determinísticos: repetir só gasta rate limit).
 * - Repetimos até 2x erros de rede/5xx.
 */
export function createQueryClient() {
  return new QueryClient({
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
