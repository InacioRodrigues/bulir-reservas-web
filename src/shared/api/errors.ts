import { isAxiosError } from 'axios'
import type { ErrorEnvelope, FieldError } from '@/shared/contract/types'

/** Códigos extra gerados no cliente (sem resposta da API). */
export type ClientErrorCode = 'NETWORK_ERROR' | 'TIMEOUT' | 'SESSION_EXPIRED' | 'UNKNOWN'

/** Erro uniforme usado em toda a app, venha da API ou da rede. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: FieldError[]
  /** Segundos indicados no header Retry-After (respostas 429). */
  readonly retryAfter: number | null
  readonly correlationId: string | null

  constructor(params: {
    status: number
    code: string
    message: string
    fieldErrors?: FieldError[]
    retryAfter?: number | null
    correlationId?: string | null
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.code = params.code
    this.fieldErrors = params.fieldErrors ?? []
    this.retryAfter = params.retryAfter ?? null
    this.correlationId = params.correlationId ?? null
  }

  is(code: string): boolean {
    return this.code === code
  }
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    (value as { success?: unknown }).success === false
  )
}

function parseRetryAfter(header: unknown): number | null {
  if (typeof header !== 'string' && typeof header !== 'number') return null
  const seconds = Number(header)
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : null
}

/** Converte qualquer erro (axios, rede, código) num ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (isAxiosError(error)) {
    const response = error.response
    if (!response) {
      const timeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      return new ApiError({
        status: 0,
        code: timeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: timeout
          ? 'O servidor demorou demasiado a responder.'
          : 'Sem ligação ao servidor. Verifique a sua ligação à internet.',
      })
    }
    const body: unknown = response.data
    const retryAfter = parseRetryAfter(response.headers['retry-after'])
    if (isErrorEnvelope(body)) {
      return new ApiError({
        status: response.status,
        code: body.code,
        message: body.message,
        fieldErrors: body.errors,
        retryAfter,
        correlationId: body.correlationId ?? null,
      })
    }
    return new ApiError({
      status: response.status,
      code: response.status === 429 ? 'TOO_MANY_REQUESTS' : 'UNKNOWN',
      message: error.message,
      retryAfter,
    })
  }

  return new ApiError({
    status: 0,
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'Erro inesperado.',
  })
}

/** Mensagens em português, mais orientadas ao utilizador do que as da API. */
const MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Alguns dados são inválidos. Reveja os campos assinalados.',
  INVALID_CREDENTIALS: 'E-mail/NIF ou senha incorretos.',
  UNAUTHORIZED: 'Precisa de iniciar sessão para continuar.',
  SESSION_EXPIRED: 'A sua sessão expirou. Inicie sessão novamente.',
  FORBIDDEN: 'Não tem permissão para realizar esta ação.',
  NOT_FOUND: 'O recurso pedido não existe ou foi removido.',
  EMAIL_ALREADY_EXISTS: 'Já existe uma conta com este e-mail.',
  NIF_ALREADY_EXISTS: 'Já existe uma conta com este NIF.',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente para contratar este serviço.',
  BOOKING_ALREADY_CANCELLED: 'Esta reserva já tinha sido cancelada.',
  PROVIDER_INSUFFICIENT_BALANCE:
    'O prestador não tem saldo suficiente para devolver o valor. Contacte o prestador.',
  PAYLOAD_TOO_LARGE: 'Os dados enviados são demasiado grandes.',
  UNSUPPORTED_MEDIA_TYPE: 'Formato de pedido não suportado.',
  NETWORK_ERROR: 'Sem ligação ao servidor. Verifique a sua ligação à internet.',
  TIMEOUT: 'O servidor demorou demasiado a responder. Tente novamente.',
  INTERNAL_SERVER_ERROR: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
}

/** Mensagem pronta a mostrar ao utilizador para qualquer erro. */
export function getErrorMessage(error: unknown): string {
  const apiError = toApiError(error)
  if (apiError.code === 'TOO_MANY_REQUESTS') {
    return apiError.retryAfter
      ? `Demasiadas tentativas. Tente novamente dentro de ${apiError.retryAfter} s.`
      : 'Demasiadas tentativas. Aguarde um momento e tente novamente.'
  }
  return MESSAGES[apiError.code] ?? apiError.message ?? 'Ocorreu um erro inesperado.'
}

/**
 * Copia os erros por campo de um 400 VALIDATION_ERROR para o formulário
 * (react-hook-form `setError`). Devolve true se algum campo foi assinalado.
 */
export function applyFieldErrors<TField extends string>(
  error: unknown,
  setError: (field: TField, error: { type: string; message: string }) => void,
  knownFields: readonly TField[],
): boolean {
  const apiError = toApiError(error)
  let applied = false
  for (const fieldError of apiError.fieldErrors) {
    const field = knownFields.find((name) => name === fieldError.field)
    if (field) {
      setError(field, { type: 'server', message: fieldError.message })
      applied = true
    }
  }
  return applied
}
