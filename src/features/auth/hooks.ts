import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { queryKeys } from '@/shared/api/query-keys'
import { paths } from '@/shared/config/paths'
import type { AuthResponse } from '@/shared/contract/types'
import { selectIsAuthenticated, useSessionStore } from '@/shared/session/session-store'
import { authApi, type RegisterPayload } from './api'

/**
 * Perfil + saldo do utilizador autenticado (estado do SERVIDOR).
 * Usa o snapshot da sessão como placeholder para a UI não "piscar", mas vai sempre à API.
 * Refaz o pedido a cada 30 s com a aba visível: o prestador vê o saldo subir quando um
 * cliente o contrata, sem recarregar a página.
 */
export function useMe() {
  const isAuthenticated = useSessionStore(selectIsAuthenticated)
  const snapshot = useSessionStore((state) => state.user)
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const user = await authApi.me()
      useSessionStore.getState().setUser(user)
      return user
    },
    enabled: isAuthenticated,
    placeholderData: snapshot ?? undefined,
    refetchInterval: 30_000,
  })
}

/** Utilizador atual (perfil mais recente conhecido). Só usar dentro de rotas protegidas. */
export function useCurrentUser() {
  const { data } = useMe()
  const snapshot = useSessionStore((state) => state.user)
  const user = data ?? snapshot
  if (!user) throw new Error('useCurrentUser usado fora de uma rota autenticada')
  return user
}

function useStartSession() {
  const queryClient = useQueryClient()
  return (session: AuthResponse) => {
    queryClient.clear()
    useSessionStore.getState().setSession(session)
    queryClient.setQueryData(queryKeys.me, session.user)
  }
}

export function useLogin() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: startSession,
  })
}

export function useRegister() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: startSession,
  })
}

/** Revoga o refresh token na API (melhor esforço) e limpa sessão + cache. */
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async () => {
      const { refreshToken } = useSessionStore.getState()
      if (refreshToken) await authApi.logout(refreshToken).catch(() => undefined)
    },
    onSettled: () => {
      useSessionStore.getState().clear()
      queryClient.clear()
      navigate(paths.login, { replace: true })
      toast.success('Sessão terminada.')
    },
  })
}
