import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { API, apiError, clientUser, ok } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'
import type { User } from '@/shared/contract/types'
import { useSessionStore } from '@/shared/session/session-store'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('valida campos obrigatórios sem chamar a API', async () => {
    const onSuccess = vi.fn<(user: User) => void>()
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Indique o e-mail ou o NIF')).toBeInTheDocument()
    expect(screen.getByText('Indique a senha')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('entra por NIF, guarda a sessão e chama onSuccess', async () => {
    let body: unknown
    server.use(
      http.post(`${API}/auth/login`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          ok({ user: clientUser, accessToken: 'access-1', refreshToken: 'refresh-1' }),
        )
      }),
    )
    const onSuccess = vi.fn<(user: User) => void>()
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('E-mail ou NIF'), '004512345LA041')
    expect(screen.getByText('A entrar com NIF.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Senha'), 'Senha@123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(clientUser))
    expect(body).toEqual({ identifier: '004512345LA041', password: 'Senha@123' })
    expect(useSessionStore.getState().accessToken).toBe('access-1')
  })

  it('mostra erro genérico com credenciais inválidas e limpa a senha', async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json(apiError(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas'), {
          status: 401,
        }),
      ),
    )
    const { user } = renderWithProviders(<LoginForm onSuccess={vi.fn<(user: User) => void>()} />)
    await user.type(screen.getByLabelText('E-mail ou NIF'), 'ana@exemplo.ao')
    await user.type(screen.getByLabelText('Senha'), 'errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('E-mail/NIF ou senha incorretos.')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveValue('')
  })

  it('bloqueia o botão durante o Retry-After de um 429', async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json(apiError(429, 'TOO_MANY_REQUESTS', 'x'), {
          status: 429,
          headers: { 'Retry-After': '42' },
        }),
      ),
    )
    const { user } = renderWithProviders(<LoginForm onSuccess={vi.fn<(user: User) => void>()} />)
    await user.type(screen.getByLabelText('E-mail ou NIF'), 'ana@exemplo.ao')
    await user.type(screen.getByLabelText('Senha'), 'x')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('button', { name: /Aguarde 42 s/ })).toBeDisabled()
  })
})
