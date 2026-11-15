import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-keys'
import type { PageParams, ServiceListParams } from '@/shared/contract/types'
import { servicesApi, type ServicePayload } from './api'

export const SERVICES_PER_PAGE = 12

export function useCatalog(params: ServiceListParams) {
  return useQuery({
    queryKey: queryKeys.services.catalog(params),
    queryFn: () => servicesApi.catalog(params),
    placeholderData: keepPreviousData,
  })
}

export function useMyServices(params: PageParams) {
  return useQuery({
    queryKey: queryKeys.services.mine(params),
    queryFn: () => servicesApi.mine(params),
    placeholderData: keepPreviousData,
  })
}

/**
 * Depois de qualquer escrita invalidamos TODA a árvore ['services'] (minhas listas,
 * catálogo e detalhes): a cache fica coerente sem atualizações manuais propensas a erros.
 */
function useInvalidateServices() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.services.all })
}

export function useCreateService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: (payload: ServicePayload) => servicesApi.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ServicePayload> }) =>
      servicesApi.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: invalidate,
  })
}
