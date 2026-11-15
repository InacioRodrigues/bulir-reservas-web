import { NavLink, Outlet, Link } from 'react-router'
import { BalanceBadge } from '@/features/wallet/components/BalanceBadge'
import { useCurrentUser } from '@/features/auth/hooks'
import { homePathFor, ROLE_LABEL } from '@/features/auth/roles'
import { Logo } from '@/shared/components/Logo'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { navItemsFor } from './nav-items'
import { UserMenu } from './UserMenu'

export function AppLayout() {
  const user = useCurrentUser()
  const items = navItemsFor(user.role)

  return (
    <div className="min-h-svh bg-muted/30">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
      >
        Saltar para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link to={homePathFor(user.role)} aria-label="Página inicial">
            <Logo className="hidden sm:inline-flex" />
            <Logo compact className="sm:hidden" />
          </Link>
          <Badge variant="outline" className="hidden sm:inline-flex">
            {ROLE_LABEL[user.role]}
          </Badge>
          <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 md:flex">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-accent font-medium text-accent-foreground',
                  )
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <BalanceBadge />
            <UserMenu />
          </div>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-6xl px-4 py-6 pb-28 md:pb-10">
        <Outlet />
      </main>

      <nav
        aria-label="Principal (mobile)"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-3">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 py-2.5 text-xs text-muted-foreground',
                    isActive && 'font-medium text-primary',
                  )
                }
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
