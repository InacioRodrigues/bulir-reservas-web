import { expect, test } from '@playwright/test'
import { login } from './helpers.ts'

test('prestador cria, edita e exclui um serviço', async ({ page }) => {
  const name = `Serviço E2E ${Date.now()}`
  await login(page, 'carla.prestadora@bulir.demo')
  await expect(page).toHaveURL(/\/meus-servicos/)

  await page.getByRole('button', { name: 'Novo serviço' }).click()
  await page.getByLabel('Título').fill(name)
  await page.getByLabel('Descrição').fill('Serviço criado pelo teste end-to-end.')
  await page.getByLabel('Preço (Kz)').fill('1234,50')
  await page.getByRole('button', { name: 'Criar serviço' }).click()
  await expect(page.getByRole('heading', { name })).toBeVisible()

  await page.getByRole('button', { name: `Editar ${name}` }).click()
  await page.getByLabel('Preço (Kz)').fill('2000')
  await page.getByRole('button', { name: 'Guardar alterações' }).click()
  await expect(page.getByText('Serviço atualizado.')).toBeVisible()

  await page.getByRole('button', { name: `Excluir ${name}` }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByRole('heading', { name })).toHaveCount(0)

  // Um prestador não acede ao catálogo de clientes.
  await page.goto('/servicos')
  await expect(page.getByText('Acesso restrito')).toBeVisible()
})
