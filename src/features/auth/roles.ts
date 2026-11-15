import type { Role } from '@/shared/contract/types'
import { paths } from '@/shared/config/paths'

export const ROLE_LABEL: Record<Role, string> = {
  CLIENT: 'Cliente',
  PROVIDER: 'Prestador',
}

/** Página inicial de cada papel após o login. */
export function homePathFor(role: Role): string {
  return role === 'PROVIDER' ? paths.myServices : paths.catalog
}
