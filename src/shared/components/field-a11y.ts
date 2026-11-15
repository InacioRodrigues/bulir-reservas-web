/** Props de acessibilidade para ligar o input à mensagem de erro/ajuda. */
export function fieldA11y(id: string, error?: string, hasHint = false) {
  const describedBy = [error && `${id}-error`, hasHint && `${id}-hint`].filter(Boolean).join(' ')
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  } as const
}
