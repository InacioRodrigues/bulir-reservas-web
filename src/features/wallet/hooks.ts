import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-keys'
import type { PageParams, User } from '@/shared/contract/types'
import { walletApi } from './api'

export function useTransactions(params: PageParams) {
  return useQuery({
    queryKey: queryKeys.wallet.transactions(params),
    queryFn: () => walletApi.transactions(params),
    placeholderData: keepPreviousData,
  })
}

export function useTopUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: string) => walletApi.topUp(amount),
    onSuccess: ({ balance }) => {
      // A API devolve o saldo final: escrevemo-lo já na cache (valor do servidor, não calculado).
      queryClient.setQueryData<User>(queryKeys.me, (user) => (user ? { ...user, balance } : user))
      return queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all })
    },
  })
}
