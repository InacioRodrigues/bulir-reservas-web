import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PageMeta } from '@/shared/contract/types'
import { Button } from '@/shared/ui/button'

export function PaginationControls({
  meta,
  onPageChange,
  disabled,
}: {
  meta: PageMeta
  onPageChange: (page: number) => void
  disabled?: boolean
}) {
  if (meta.totalPages <= 1) return null
  return (
    <nav
      aria-label="Paginação"
      className="mt-6 flex items-center justify-between gap-3 text-sm text-muted-foreground"
    >
      <span>
        Página {meta.page} de {meta.totalPages} · {meta.total} no total
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={disabled || meta.page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft /> Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={disabled || meta.page >= meta.totalPages}
          aria-label="Página seguinte"
        >
          Seguinte <ChevronRight />
        </Button>
      </div>
    </nav>
  )
}
