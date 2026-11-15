import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import type { User } from '@/shared/contract/types'
import { useSessionStore } from '@/shared/session/session-store'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
  })
}

interface RenderOptions {
  /** Sessão inicial (utilizador autenticado). */
  user?: User
  route?: string
  /** Rotas extra (ex.: destino de redirecionamentos). */
  routes?: RouteObject[]
  path?: string
}

/** Renderiza com QueryClient novo, router em memória e (opcionalmente) sessão ativa. */
export function renderWithProviders(ui: ReactElement, options: RenderOptions = {}) {
  const { user, route = '/', routes = [], path = '/' } = options
  if (user) {
    useSessionStore
      .getState()
      .setSession({ user, accessToken: 'access-1', refreshToken: 'refresh-1' })
  }
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter([{ path, element: ui }, ...routes], { initialEntries: [route] })
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { ...result, router, queryClient, user: userEvent.setup() }
}
