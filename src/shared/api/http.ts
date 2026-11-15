import axios, { isAxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/shared/config/env'
import type { AuthTokens, Paginated, SuccessEnvelope } from '@/shared/contract/types'
import { expireSession, useSessionStore } from '@/shared/session/session-store'
import { ApiError, toApiError } from './errors'

/**
 * Cliente HTTP único da app.
 *  - request: injeta `Authorization: Bearer <accessToken>`;
 *  - response: em 401 tenta UM refresh (rotativo) e repete o pedido; se o refresh falhar,
 *    termina a sessão; todos os erros saem normalizados como ApiError.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

interface RetriableConfig extends InternalAxiosRequestConfig {
  retriedAfterRefresh?: boolean
}

/** Rotas onde um 401 é resposta legítima e não deve disparar refresh. */
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']
const isAuthRoute = (url = '') => AUTH_ROUTES.some((route) => url.endsWith(route))

http.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ------------------------------------------------------------------------------------------ */
/* Refresh token rotativo                                                                       */
/* ------------------------------------------------------------------------------------------ */

let refreshInFlight: Promise<string> | null = null

/**
 * A API roda o refresh token a cada uso e, se um token já usado for reapresentado,
 * revoga TODAS as sessões do utilizador (deteção de roubo). Por isso:
 *  1. dentro da aba, pedidos 401 simultâneos partilham a mesma promessa (single-flight);
 *  2. entre abas, um Web Lock serializa o refresh e, ao obtê-lo, verificamos se outra aba
 *     já renovou o token (o localStorage é a fonte comum).
 */
export function refreshAccessToken(failedAccessToken: string | null): Promise<string> {
  refreshInFlight ??= withCrossTabLock(() => doRefresh(failedAccessToken)).finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function withCrossTabLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('bulir-auth-refresh', fn)
  }
  return fn()
}

async function doRefresh(failedAccessToken: string | null): Promise<string> {
  await useSessionStore.persist.rehydrate()
  const session = useSessionStore.getState()

  // Outra aba já renovou enquanto esperávamos pelo lock: basta usar o token novo.
  if (session.accessToken && session.accessToken !== failedAccessToken) {
    return session.accessToken
  }
  if (!session.refreshToken) throw sessionExpired()

  try {
    // axios "cru" (sem interceptors) para não entrar em ciclo.
    const response = await axios.post<SuccessEnvelope<AuthTokens>>(
      `${env.apiBaseUrl}/auth/refresh`,
      { refreshToken: session.refreshToken },
      { timeout: 15_000, headers: { 'Content-Type': 'application/json' } },
    )
    useSessionStore.getState().setTokens(response.data.data)
    return response.data.data.accessToken
  } catch (error) {
    const apiError = toApiError(error)
    // Só terminamos a sessão se a API rejeitou o refresh token; falhas de rede não deslogam.
    if (apiError.status === 401 || apiError.status === 400) {
      expireSession()
      throw sessionExpired()
    }
    throw apiError
  }
}

const sessionExpired = () =>
  new ApiError({ status: 401, code: 'SESSION_EXPIRED', message: 'Sessão expirada.' })

http.interceptors.response.use(undefined, async (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 401 && error.config) {
    const config = error.config as RetriableConfig
    if (!config.retriedAfterRefresh && !isAuthRoute(config.url)) {
      config.retriedAfterRefresh = true
      const failedToken = String(config.headers.Authorization ?? '').replace(/^Bearer /, '') || null
      const accessToken = await refreshAccessToken(failedToken)
      config.headers.Authorization = `Bearer ${accessToken}`
      return http(config)
    }
  }
  throw toApiError(error)
})

/* ------------------------------------------------------------------------------------------ */
/* Desembrulhar o envelope { success, data, meta }                                              */
/* ------------------------------------------------------------------------------------------ */

export async function unwrap<T>(request: Promise<AxiosResponse<SuccessEnvelope<T>>>): Promise<T> {
  const response = await request
  return response.data.data
}

export async function unwrapPage<T>(
  request: Promise<AxiosResponse<SuccessEnvelope<T[]>>>,
): Promise<Paginated<T>> {
  const response = await request
  const { data, meta } = response.data
  return {
    items: data,
    meta: meta ?? { page: 1, perPage: data.length, total: data.length, totalPages: 1 },
  }
}

/** Remove parâmetros vazios para não enviar `?search=` à API (que validaria string vazia). */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  ) as Partial<T>
}
