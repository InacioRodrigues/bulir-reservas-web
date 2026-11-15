import { useEffect } from 'react'

const APP_NAME = 'Bulir Reservas'

/** Título do separador por página (ajuda leitores de ecrã e o histórico do browser). */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`
  }, [title])
}
