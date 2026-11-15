import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { clientUser, providerUser } from '@/test/fixtures'
import { RequireAuth, RequireRole } from './guards'

describe('guards de rota', () => {
  it('RequireAuth envia para o login quem não tem sessão', async () => {
    renderWithProviders(<RequireAuth />, {
      route: '/meus-servicos',
      path: '/meus-servicos',
      routes: [{ path: '/login', element: <p>Ecrã de login</p> }],
    })
    expect(await screen.findByText('Ecrã de login')).toBeInTheDocument()
  })

  it('RequireRole deixa passar o papel certo', async () => {
    renderWithProviders(
      <RequireRole allow={['PROVIDER']}>
        <p>Área do prestador</p>
      </RequireRole>,
      { user: providerUser },
    )
    expect(await screen.findByText('Área do prestador')).toBeInTheDocument()
  })

  it('RequireRole bloqueia um cliente na área de prestador', async () => {
    renderWithProviders(
      <RequireRole allow={['PROVIDER']}>
        <p>Área do prestador</p>
      </RequireRole>,
      { user: clientUser },
    )
    expect(await screen.findByText('Acesso restrito')).toBeInTheDocument()
    expect(screen.queryByText('Área do prestador')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /página inicial/ })).toHaveAttribute(
      'href',
      '/servicos',
    )
  })
})
