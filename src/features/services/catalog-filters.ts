import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { ServiceListParams, ServiceSort } from '@/shared/contract/types'
import { isMoney } from '@/shared/lib/money'

export const SORT_OPTIONS: { value: ServiceSort; label: string }[] = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Preço: mais baixo' },
  { value: 'price_desc', label: 'Preço: mais alto' },
  { value: 'name_asc', label: 'Nome (A–Z)' },
  { value: 'oldest', label: 'Mais antigos' },
]

const SORTS = new Set<string>(SORT_OPTIONS.map((option) => option.value))

export interface CatalogFilters {
  search: string
  minPrice: string
  maxPrice: string
  sort: ServiceSort
  page: number
}

/** Filtros do catálogo guardados no URL (?q=&min=&max=&sort=&page=): partilháveis e com "voltar". */
export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<CatalogFilters>(() => {
    const sort = searchParams.get('sort') ?? 'newest'
    const page = Number(searchParams.get('page'))
    const money = (key: string) => {
      const value = searchParams.get(key) ?? ''
      return isMoney(value) ? value : ''
    }
    return {
      search: (searchParams.get('q') ?? '').slice(0, 100),
      minPrice: money('min'),
      maxPrice: money('max'),
      sort: (SORTS.has(sort) ? sort : 'newest') as ServiceSort,
      page: Number.isInteger(page) && page > 0 ? page : 1,
    }
  }, [searchParams])

  const update = useCallback(
    (changes: Partial<CatalogFilters>) => {
      setSearchParams(
        (params) => {
          const keys: Record<keyof CatalogFilters, string> = {
            search: 'q',
            minPrice: 'min',
            maxPrice: 'max',
            sort: 'sort',
            page: 'page',
          }
          for (const [field, value] of Object.entries(changes)) {
            const key = keys[field as keyof CatalogFilters]
            const empty =
              value === '' ||
              (field === 'sort' && value === 'newest') ||
              (field === 'page' && value === 1)
            if (empty) params.delete(key)
            else params.set(key, String(value))
          }
          // Mudar filtros volta à primeira página.
          if (!('page' in changes)) params.delete('page')
          return params
        },
        { replace: !('page' in changes) },
      )
    },
    [setSearchParams],
  )

  const reset = useCallback(() => setSearchParams({}), [setSearchParams])
  const active = Boolean(filters.search || filters.minPrice || filters.maxPrice)

  return { filters, update, reset, active }
}

export function toListParams(filters: CatalogFilters, perPage: number): ServiceListParams {
  return {
    page: filters.page,
    perPage,
    search: filters.search.trim() || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    sort: filters.sort,
  }
}
