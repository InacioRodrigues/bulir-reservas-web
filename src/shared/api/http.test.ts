import { http as mswHttp, HttpResponse } from 'msw'
import { API, apiError, ok, page } from '@/test/fixtures'
import { server } from '@/test/server'
import { onSessionExpired, useSessionStore } from '@/shared/session/session-store'
import { http, unwrapPage } from './http'

const startSession = () =>
  useSessionStore.getState().setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' })

describe('http client', () => {
  it('envia o access token no header Authorization', async () => {
    startSession()
    let authorization: string | null = null
    server.use(
      mswHttp.get(`${API}/bookings`, ({ request }) => {
        authorization = request.headers.get('authorization')
        return HttpResponse.json(page([]))
      }),
    )
    await http.get('/bookings')
    expect(authorization).toBe('Bearer access-1')
  })

  it('faz UM só refresh para vários 401 em simultâneo e repete os pedidos', async () => {
    startSession()
    let refreshCalls = 0
    server.use(
      mswHttp.get(`${API}/bookings`, ({ request }) =>
        request.headers.get('authorization') === 'Bearer access-2'
          ? HttpResponse.json(page([]))
          : HttpResponse.json(apiError(401, 'UNAUTHORIZED', 'Token expirado'), { status: 401 }),
      ),
      mswHttp.post(`${API}/auth/refresh`, async ({ request }) => {
        refreshCalls += 1
        const body = (await request.json()) as { refreshToken: string }
        expect(body.refreshToken).toBe('refresh-1')
        return HttpResponse.json(ok({ accessToken: 'access-2', refreshToken: 'refresh-2' }))
      }),
    )

    const results = await Promise.all([
      unwrapPage(http.get('/bookings')),
      unwrapPage(http.get('/bookings')),
      unwrapPage(http.get('/bookings')),
    ])

    expect(refreshCalls).toBe(1)
    expect(results).toHaveLength(3)
    expect(useSessionStore.getState()).toMatchObject({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    })
  })

  it('termina a sessão e avisa quando o refresh é rejeitado', async () => {
    startSession()
    const expired = vi.fn<() => void>()
    const unsubscribe = onSessionExpired(expired)
    server.use(
      mswHttp.get(`${API}/bookings`, () =>
        HttpResponse.json(apiError(401, 'UNAUTHORIZED', 'x'), { status: 401 }),
      ),
      mswHttp.post(`${API}/auth/refresh`, () =>
        HttpResponse.json(apiError(401, 'UNAUTHORIZED', 'Refresh inválido'), { status: 401 }),
      ),
    )

    await expect(http.get('/bookings')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    expect(useSessionStore.getState().accessToken).toBeNull()
    expect(expired).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('não tenta refresh num 401 do login (credenciais erradas)', async () => {
    let refreshCalls = 0
    server.use(
      mswHttp.post(`${API}/auth/login`, () =>
        HttpResponse.json(apiError(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas'), {
          status: 401,
        }),
      ),
      mswHttp.post(`${API}/auth/refresh`, () => {
        refreshCalls += 1
        return HttpResponse.json(ok({}))
      }),
    )
    await expect(http.post('/auth/login', {})).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    })
    expect(refreshCalls).toBe(0)
  })

  it('normaliza 429 com Retry-After', async () => {
    server.use(
      mswHttp.post(`${API}/bookings`, () =>
        HttpResponse.json(apiError(429, 'TOO_MANY_REQUESTS', 'Muitos pedidos'), {
          status: 429,
          headers: { 'Retry-After': '30' },
        }),
      ),
    )
    await expect(http.post('/bookings', {})).rejects.toMatchObject({
      status: 429,
      retryAfter: 30,
    })
  })
})
