import { RouterProvider } from 'react-router/dom'
import { AppProviders } from './providers'
import { queryClient } from './query-client'
import { router } from './router'

export function App() {
  return (
    <AppProviders client={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
