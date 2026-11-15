import type { ReactNode } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router'
import { ShieldAlert } from 'lucide-react'
import { paths } from '@/shared/config/paths'
import type { Role } from '@/shared/contract/types'
import { EmptyState } from '@/shared/components/EmptyState'
import { selectIsAuthenticated, useSessionStore } from '@/shared/session/session-store'
import { Button } from '@/shared/ui/button'
import { homePathFor, ROLE_LABEL } from '../roles'

/**
 * Guards de rota. ATENÇÃO: isto é UX, não segurança. Esconder ecrãs por papel evita
 * confusão, mas quem garante as permissões é a API (JWT + RolesGuard + regras de dono).
 */
export function RequireAuth() {
  const isAuthenticated = useSessionStore(selectIsAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function RequireRole({ allow, children }: { allow: Role[]; children?: ReactNode }) {
  const user = useSessionStore((state) => state.user)
  if (!user) return <Navigate to={paths.login} replace />
  if (!allow.includes(user.role)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Acesso restrito"
        description={`Esta página é exclusiva para ${allow.map((role) => ROLE_LABEL[role].toLowerCase() + 's').join(' e ')}. Entrou como ${ROLE_LABEL[user.role].toLowerCase()}.`}
        action={
          <Button asChild>
            <Link to={homePathFor(user.role)}>Ir para a minha página inicial</Link>
          </Button>
        }
      />
    )
  }
  return children ?? <Outlet />
}

/** Login/registo não fazem sentido com sessão ativa. */
export function RedirectIfAuthenticated() {
  const user = useSessionStore((state) => state.user)
  const isAuthenticated = useSessionStore(selectIsAuthenticated)
  if (isAuthenticated && user) return <Navigate to={homePathFor(user.role)} replace />
  return <Outlet />
}

export function RoleHomeRedirect() {
  const user = useSessionStore((state) => state.user)
  return <Navigate to={user ? homePathFor(user.role) : paths.login} replace />
}
