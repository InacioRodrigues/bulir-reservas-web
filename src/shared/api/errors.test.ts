import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { ApiError, applyFieldErrors, getErrorMessage, toApiError } from './errors'

function axiosErrorWith(status: number, data: unknown, headers: Record<string, string> = {}) {
  const response = {
    status,
    data,
    headers: new AxiosHeaders(headers),
    statusText: '',
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, response)
}

const envelope = (code: string, message: string, errors: unknown[] = []) => ({
  success: false,
  statusCode: 409,
  code,
  message,
  errors,
})

describe('toApiError', () => {
  it('lê o envelope de erro da API', () => {
    const error = toApiError(
      axiosErrorWith(409, envelope('INSUFFICIENT_BALANCE', 'Saldo insuficiente')),
    )
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(409)
    expect(error.is('INSUFFICIENT_BALANCE')).toBe(true)
  })

  it('lê o Retry-After de um 429', () => {
    const error = toApiError(
      axiosErrorWith(429, envelope('TOO_MANY_REQUESTS', 'x'), { 'retry-after': '42' }),
    )
    expect(error.retryAfter).toBe(42)
    expect(getErrorMessage(error)).toContain('42 s')
  })

  it('distingue falta de rede', () => {
    const error = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'))
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.status).toBe(0)
  })

  it('usa mensagens em português por código', () => {
    expect(
      getErrorMessage(toApiError(axiosErrorWith(401, envelope('INVALID_CREDENTIALS', 'x')))),
    ).toBe('E-mail/NIF ou senha incorretos.')
  })
})

describe('applyFieldErrors', () => {
  it('assinala só os campos conhecidos do formulário', () => {
    const setError = vi.fn<(field: string, error: { type: string; message: string }) => void>()
    const error = axiosErrorWith(
      400,
      envelope('VALIDATION_ERROR', 'Dados inválidos', [
        { field: 'price', message: 'Preço inválido' },
        { field: 'other', message: 'ignorado' },
      ]),
    )
    expect(applyFieldErrors(error, setError, ['name', 'price'] as const)).toBe(true)
    expect(setError).toHaveBeenCalledTimes(1)
    expect(setError).toHaveBeenCalledWith('price', { type: 'server', message: 'Preço inválido' })
  })
})
