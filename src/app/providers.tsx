import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, type ReactNode } from 'react'
import { startSessionTabSync, useSessionStore } from '@/shared/session/session-store'
import { startThemeSync } from '@/shared/theme/theme-store'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'

export function AppProviders({ client, children }: { client: QueryClient; children: ReactNode }) {
  useEffect(() => startThemeSync(), [])
  useEffect(() => startSessionTabSync(), [])

  // Sessão terminou (logout, refresh falhado ou noutra aba): não deixar dados do
  // utilizador anterior em cache.
  useEffect(
    () =>
      useSessionStore.subscribe((state, previous) => {
        if (previous.accessToken && !state.accessToken) client.clear()
      }),
    [client],
  )

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>
        {children}
        <Toaster richColors closeButton position="top-center" />
      </TooltipProvider>
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
    </QueryClientProvider>
  )
}
