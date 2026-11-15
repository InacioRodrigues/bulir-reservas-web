import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthResponse, AuthTokens, User } from '@/shared/contract/types'

/**
 * Estado de sessão (estado de CLIENTE): tokens + último perfil conhecido.
 * Persistido no localStorage para sobreviver a um refresh da página.
 *
 * O perfil aqui é só um snapshot para decidir rotas/papel sem esperar pela rede;
 * o saldo "vivo" vem sempre do servidor via TanStack Query (`useMe`).
 */
interface SessionState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  setSession: (session: AuthResponse) => void
  setTokens: (tokens: AuthTokens) => void
  setUser: (user: User) => void
  clear: () => void
}

const initial = { accessToken: null, refreshToken: null, user: null }

export const SESSION_STORAGE_KEY = 'bulir-session'

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initial,
      setSession: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      clear: () => set(initial),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ accessToken, refreshToken, user }) => ({ accessToken, refreshToken, user }),
    },
  ),
)

/** Mantém várias abas sincronizadas: login/logout/refresh numa aba reflete-se nas outras. */
export function startSessionTabSync() {
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_STORAGE_KEY) void useSessionStore.persist.rehydrate()
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

/* Evento "sessão expirou" (refresh rejeitado pela API), para a UI avisar o utilizador. */
const expiredListeners = new Set<() => void>()

export function onSessionExpired(listener: () => void) {
  expiredListeners.add(listener)
  return () => {
    expiredListeners.delete(listener)
  }
}

/** Termina a sessão porque a API rejeitou o refresh token (expirado, revogado ou reutilizado). */
export function expireSession() {
  useSessionStore.getState().clear()
  expiredListeners.forEach((listener) => listener())
}

export const selectIsAuthenticated = (state: SessionState) =>
  Boolean(state.accessToken && state.user)
