import { createBrowserRouter, type RouteObject } from 'react-router'
import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequireRole,
  RoleHomeRedirect,
} from '@/features/auth/components/guards'
import { FullPageSpinner } from '@/shared/components/FullPageSpinner'
import { paths } from '@/shared/config/paths'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { NotFoundPage } from './NotFoundPage'
import { RouteErrorBoundary } from './RouteErrorBoundary'

/** Páginas carregadas a pedido (code splitting por rota). */
export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorBoundary />,
    hydrateFallbackElement: <FullPageSpinner />,
    children: [
      {
        element: <RedirectIfAuthenticated />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: paths.login,
                lazy: async () => ({
                  Component: (await import('@/features/auth/components/LoginPage')).LoginPage,
                }),
              },
              {
                path: paths.register,
                lazy: async () => ({
                  Component: (await import('@/features/auth/components/RegisterPage')).RegisterPage,
                }),
              },
            ],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <RoleHomeRedirect /> },
              {
                element: <RequireRole allow={['CLIENT']} />,
                children: [
                  {
                    path: paths.catalog,
                    lazy: async () => ({
                      Component: (await import('@/features/services/pages/CatalogPage'))
                        .CatalogPage,
                    }),
                  },
                ],
              },
              {
                element: <RequireRole allow={['PROVIDER']} />,
                children: [
                  {
                    path: paths.myServices,
                    lazy: async () => ({
                      Component: (await import('@/features/services/pages/MyServicesPage'))
                        .MyServicesPage,
                    }),
                  },
                ],
              },
              {
                path: paths.bookings,
                lazy: async () => ({
                  Component: (await import('@/features/bookings/pages/BookingsPage')).BookingsPage,
                }),
              },
              {
                path: paths.wallet,
                lazy: async () => ({
                  Component: (await import('@/features/wallet/pages/WalletPage')).WalletPage,
                }),
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
