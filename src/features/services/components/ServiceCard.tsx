import type { ReactNode } from 'react'
import { UserRound } from 'lucide-react'
import { Amount } from '@/shared/components/Amount'
import type { Service } from '@/shared/contract/types'
import { formatDate } from '@/shared/lib/date'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

interface ServiceCardProps {
  service: Service
  /** Mostrar o prestador (catálogo) ou não (os meus serviços). */
  showProvider?: boolean
  /** Ações específicas do contexto (editar/excluir ou contratar). */
  actions?: ReactNode
}

/** Cartão de apresentação reutilizado no catálogo e na área do prestador. */
export function ServiceCard({ service, showProvider = false, actions }: ServiceCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base">
          <h3>{service.name}</h3>
        </CardTitle>
        {showProvider ? (
          <CardDescription className="flex items-center gap-1.5">
            <UserRound className="size-3.5" aria-hidden="true" />
            {service.provider.fullName}
          </CardDescription>
        ) : (
          <CardDescription>Atualizado a {formatDate(service.updatedAt)}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">{service.description}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <Amount value={service.price} className="text-lg font-semibold text-foreground" />
        {actions && <div className="flex gap-2">{actions}</div>}
      </CardFooter>
    </Card>
  )
}

export function ServiceCardSkeleton() {
  return (
    <Card className="h-full" aria-hidden="true">
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  )
}

export function ServiceGrid({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={busy || undefined}>
      {children}
    </div>
  )
}
