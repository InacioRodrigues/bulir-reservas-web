import { zodResolver } from '@hookform/resolvers/zod'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { priceRangeSchema, type PriceRangeInput } from '@/shared/contract/schemas'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import type { ServiceSort } from '@/shared/contract/types'
import { SORT_OPTIONS, type CatalogFilters } from '../catalog-filters'

interface CatalogFiltersBarProps {
  filters: CatalogFilters
  onChange: (changes: Partial<CatalogFilters>) => void
  onReset: () => void
  active: boolean
}

export function CatalogFiltersBar({ filters, onChange, onReset, active }: CatalogFiltersBarProps) {
  // Pesquisa com debounce: não fazemos um pedido por cada tecla (e poupamos o rate limit).
  const [search, setSearch] = useState(filters.search)
  const debouncedSearch = useDebouncedValue(search)
  useEffect(() => {
    if (debouncedSearch !== filters.search) onChange({ search: debouncedSearch })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage ao valor com debounce
  }, [debouncedSearch])
  useEffect(() => setSearch(filters.search), [filters.search])

  const priceForm = useForm<PriceRangeInput, unknown, { minPrice: string; maxPrice: string }>({
    resolver: zodResolver(priceRangeSchema),
    values: {
      minPrice: filters.minPrice.replace('.', ','),
      maxPrice: filters.maxPrice.replace('.', ','),
    },
  })
  const priceErrors = priceForm.formState.errors
  const applyPrice = priceForm.handleSubmit((values) => onChange(values))

  return (
    <div className="mb-6 grid gap-3 rounded-xl border bg-card p-3 lg:grid-cols-[1fr_auto_auto]">
      <div className="relative">
        <Label htmlFor="catalog-search" className="sr-only">
          Pesquisar serviços
        </Label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="catalog-search"
          type="search"
          value={search}
          maxLength={100}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Pesquisar por nome ou descrição…"
          className="h-10 pl-9"
        />
      </div>

      <form
        onSubmit={applyPrice}
        noValidate
        className="grid grid-cols-[1fr_1fr_auto] items-start gap-2 sm:flex"
        aria-label="Filtrar por preço"
      >
        {(['minPrice', 'maxPrice'] as const).map((field) => (
          <div key={field} className="grid gap-1 sm:w-32">
            <Label htmlFor={`catalog-${field}`} className="sr-only">
              {field === 'minPrice' ? 'Preço mínimo' : 'Preço máximo'}
            </Label>
            <Input
              id={`catalog-${field}`}
              {...priceForm.register(field)}
              inputMode="decimal"
              placeholder={field === 'minPrice' ? 'Mín. Kz' : 'Máx. Kz'}
              aria-invalid={priceErrors[field] ? true : undefined}
              aria-describedby={priceErrors[field] ? `catalog-${field}-error` : undefined}
              className="h-10 tabular-nums"
            />
            {priceErrors[field] && (
              <p id={`catalog-${field}-error`} role="alert" className="text-xs text-destructive">
                {priceErrors[field]?.message}
              </p>
            )}
          </div>
        ))}
        <Button type="submit" variant="secondary" className="h-10">
          Aplicar
        </Button>
      </form>

      <div className="flex gap-2">
        <Select
          value={filters.sort}
          onValueChange={(sort) => onChange({ sort: sort as ServiceSort })}
        >
          <SelectTrigger className="h-10! flex-1 sm:min-w-44" aria-label="Ordenar por">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {active && (
          <Button
            variant="ghost"
            className="h-10"
            onClick={() => {
              setSearch('')
              onReset()
            }}
          >
            <X /> Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
