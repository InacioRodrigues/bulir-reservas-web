import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { API, apiError, clientUser, makeBooking, makeService, ok, page } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'
import { CatalogPage } from './CatalogPage'

const cheap = makeService({
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  name: 'Corte de cabelo',
  price: '5000.00',
})
const pricey = makeService({
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  name: 'Instalação de rede Wi-Fi',
  price: '25000.00',
})

function setup({ balance = '6000.00' } = {}) {
  let meCalls = 0
  server.use(
    http.get(`${API}/auth/me`, () => {
      meCalls += 1
      return HttpResponse.json(ok({ ...clientUser, balance }))
    }),
    http.get(`${API}/services`, () => HttpResponse.json(page([cheap, pricey]))),
  )
  const utils = renderWithProviders(<CatalogPage />, {
    user: { ...clientUser, balance },
    route: '/servicos',
    path: '/servicos',
  })
  return { ...utils, meCalls: () => meCalls }
}

describe('CatalogPage', () => {
  it('desativa "Contratar" e mostra quanto falta quando o saldo não chega', async () => {
    setup()
    const blocked = await screen.findByRole('button', {
      name: 'Contratar Instalação de rede Wi-Fi',
    })
    expect(blocked).toBeDisabled()
    expect(blocked).toHaveAccessibleDescription(/Saldo insuficiente · faltam 19\s000,00/)
    expect(screen.getByRole('button', { name: 'Contratar Corte de cabelo' })).toBeEnabled()
  })

  it('mostra saldo atual → saldo após e confirma a reserva', async () => {
    let bookedServiceId: string | undefined
    server.use(
      http.post(`${API}/bookings`, async ({ request }) => {
        bookedServiceId = ((await request.json()) as { serviceId: string }).serviceId
        return HttpResponse.json(ok(makeBooking()), { status: 201 })
      }),
    )
    const { user, meCalls } = setup()
    await user.click(await screen.findByRole('button', { name: 'Contratar Corte de cabelo' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/6\s000,00/)).toBeInTheDocument()
    expect(within(dialog).getByText(/^1\s000,00/)).toBeInTheDocument()
    const callsBefore = meCalls()

    await user.click(within(dialog).getByRole('button', { name: 'Confirmar contratação' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(bookedServiceId).toBe(cheap.id)
    // Saldo volta a ser lido da API depois de reservar (não é calculado no cliente).
    await waitFor(() => expect(meCalls()).toBeGreaterThan(callsBefore))
  })

  it('trata o 409 INSUFFICIENT_BALANCE da API (a autoridade é o servidor)', async () => {
    server.use(
      http.post(`${API}/bookings`, () =>
        HttpResponse.json(apiError(409, 'INSUFFICIENT_BALANCE', 'Saldo insuficiente'), {
          status: 409,
        }),
      ),
    )
    const { user } = setup()
    await user.click(await screen.findByRole('button', { name: 'Contratar Corte de cabelo' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar contratação' }))
    expect(
      await within(dialog).findByText('Saldo insuficiente para contratar este serviço.'),
    ).toBeInTheDocument()
  })
})
