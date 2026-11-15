import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-keys'
import type { BookingListParams } from '@/shared/contract/types'
import { bookingsApi } from './api'

export function useBookings(params: BookingListParams) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn: () => bookingsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/**
 * Reservar/cancelar mexe em dinheiro: NÃO fazemos atualização otimista. Esperamos pela
 * resposta da API (que faz tudo numa transação atómica) e depois invalidamos o que mudou:
 * saldo (me), reservas e movimentos da carteira. O cliente nunca calcula o saldo final.
 */
function useInvalidateMoneyViews() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.me }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all }),
    ])
}

export function useCreateBooking() {
  const invalidate = useInvalidateMoneyViews()
  return useMutation({
    mutationFn: (serviceId: string) => bookingsApi.create(serviceId),
    // Mesmo em erro (ex.: 409 saldo insuficiente) o saldo mostrado pode estar desatualizado.
    onSettled: invalidate,
  })
}

export function useCancelBooking() {
  const invalidate = useInvalidateMoneyViews()
  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancel(bookingId),
    onSettled: invalidate,
  })
}
