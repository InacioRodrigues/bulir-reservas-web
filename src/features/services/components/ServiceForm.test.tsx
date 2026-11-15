import { screen, waitFor } from '@testing-library/react'
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { makeService } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { ServiceForm } from './ServiceForm'

type Submit = (payload: object) => Promise<unknown>

describe('ServiceForm', () => {
  it('mostra os erros de validação do contrato', async () => {
    const onSubmit = vi.fn<Submit>()
    const { user } = renderWithProviders(<ServiceForm onSubmit={onSubmit} submitLabel="Criar" />)
    await user.type(screen.getByLabelText('Título'), 'ab')
    await user.type(screen.getByLabelText('Preço (Kz)'), '12,345')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    expect(await screen.findByText('O título deve ter pelo menos 3 caracteres')).toBeInTheDocument()
    expect(screen.getByText('A descrição deve ter pelo menos 10 caracteres')).toBeInTheDocument()
    expect(
      screen.getByText('O preço deve ser um número com até 2 casas decimais'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('cria com o preço normalizado como string', async () => {
    const onSubmit = vi.fn<Submit>().mockResolvedValue(undefined)
    const { user } = renderWithProviders(<ServiceForm onSubmit={onSubmit} submitLabel="Criar" />)
    await user.type(screen.getByLabelText('Título'), 'Pintura de interiores')
    await user.type(screen.getByLabelText('Descrição'), 'Paredes e tetos, material incluído.')
    await user.type(screen.getByLabelText('Preço (Kz)'), '18 500,50')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Pintura de interiores',
        description: 'Paredes e tetos, material incluído.',
        price: '18500.50',
      }),
    )
  })

  it('ao editar envia só os campos alterados', async () => {
    const onSubmit = vi.fn<Submit>().mockResolvedValue(undefined)
    const { user } = renderWithProviders(
      <ServiceForm service={makeService()} onSubmit={onSubmit} submitLabel="Guardar" />,
    )
    const save = screen.getByRole('button', { name: 'Guardar' })
    expect(save).toBeDisabled() // nada mudou ainda

    const price = screen.getByLabelText('Preço (Kz)')
    await user.clear(price)
    await user.type(price, '6000')
    await user.click(save)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ price: '6000' }))
  })

  it('mostra no campo o erro 400 devolvido pela API', async () => {
    const response = {
      status: 400,
      data: {
        success: false,
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        errors: [{ field: 'name', message: 'Nome rejeitado pela API' }],
      },
      headers: new AxiosHeaders(),
      statusText: '',
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse
    const onSubmit = vi
      .fn<Submit>()
      .mockRejectedValue(new AxiosError('400', 'ERR_BAD_REQUEST', undefined, undefined, response))
    const { user } = renderWithProviders(
      <ServiceForm service={makeService()} onSubmit={onSubmit} submitLabel="Guardar" />,
    )
    await user.type(screen.getByLabelText('Título'), ' novo')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByText('Nome rejeitado pela API')).toBeInTheDocument()
  })
})
