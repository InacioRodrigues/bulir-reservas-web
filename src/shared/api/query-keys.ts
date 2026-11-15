import type { BookingListParams, PageParams, ServiceListParams } from '@/shared/contract/types'

/**
 * Fábrica de query keys do TanStack Query. Chaves hierárquicas permitem invalidar
 * em bloco: `invalidateQueries({ queryKey: queryKeys.services.all })` apanha listas e detalhes.
 */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  services: {
    all: ['services'] as const,
    catalog: (params: ServiceListParams) => ['services', 'catalog', params] as const,
    mine: (params: PageParams) => ['services', 'mine', params] as const,
    detail: (id: string) => ['services', 'detail', id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (params: BookingListParams) => ['bookings', 'list', params] as const,
  },
  wallet: {
    all: ['wallet'] as const,
    transactions: (params: PageParams) => ['wallet', 'transactions', params] as const,
  },
} as const
