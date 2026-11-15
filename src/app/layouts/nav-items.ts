import { BriefcaseBusiness, CalendarCheck, Store, Wallet, type LucideIcon } from 'lucide-react'
import { paths } from '@/shared/config/paths'
import type { Role } from '@/shared/contract/types'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV: Record<Role, NavItem[]> = {
  CLIENT: [
    { to: paths.catalog, label: 'Serviços', icon: Store },
    { to: paths.bookings, label: 'Histórico', icon: CalendarCheck },
    { to: paths.wallet, label: 'Carteira', icon: Wallet },
  ],
  PROVIDER: [
    { to: paths.myServices, label: 'Meus serviços', icon: BriefcaseBusiness },
    { to: paths.bookings, label: 'Histórico', icon: CalendarCheck },
    { to: paths.wallet, label: 'Carteira', icon: Wallet },
  ],
}

export const navItemsFor = (role: Role) => NAV[role]
