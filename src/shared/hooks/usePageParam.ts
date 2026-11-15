import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/** Página atual guardada no URL (?page=2): partilhável e compatível com o botão "voltar". */
export function usePageParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = Number(searchParams.get('page'))
  const page = Number.isInteger(raw) && raw > 0 ? raw : 1

  const setPage = useCallback(
    (next: number) => {
      setSearchParams((params) => {
        if (next <= 1) params.delete('page')
        else params.set('page', String(next))
        return params
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setSearchParams],
  )

  return [page, setPage] as const
}
