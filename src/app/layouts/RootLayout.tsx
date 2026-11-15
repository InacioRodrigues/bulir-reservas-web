import { WifiOff } from 'lucide-react'
import { Outlet, ScrollRestoration } from 'react-router'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'

export function RootLayout() {
  const online = useOnlineStatus()
  return (
    <>
      {!online && (
        <output className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <WifiOff className="size-4" aria-hidden="true" />
          Está sem ligação à internet. Os dados podem estar desatualizados.
        </output>
      )}
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
