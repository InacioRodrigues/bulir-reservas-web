import { expect, test } from '@playwright/test'
import { loginWithDemo, readBalanceCents } from './helpers.ts'

test('cliente carrega saldo, contrata um serviço e vê-o no histórico', async ({ page }) => {
  await loginWithDemo(page, /Cliente com saldo/)
  await expect(page).toHaveURL(/\/servicos/)

  // Garante saldo suficiente para o teste ser repetível.
  await page.getByRole('button', { name: 'Carregar saldo' }).click()
  await page.getByLabel('Valor (Kz)').fill('5000')
  await page.getByRole('dialog').getByRole('button', { name: 'Carregar' }).click()
  await expect(page.getByText(/Saldo carregado/)).toBeVisible()

  const before = await readBalanceCents(page)
  await page.getByRole('button', { name: 'Contratar Corte de cabelo' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Saldo após')).toBeVisible()
  await dialog.getByRole('button', { name: 'Confirmar contratação' }).click()
  await expect(page.getByText(/Reserva de "Corte de cabelo" confirmada/)).toBeVisible()

  // O saldo vem da API depois da reserva: 5 000,00 Kz a menos.
  await expect.poll(() => readBalanceCents(page)).toBe(before - 500_000)

  await page.getByRole('link', { name: 'Histórico' }).first().click()
  const firstRow = page.locator('tbody tr').first()
  await expect(firstRow).toContainText('Corte de cabelo')
  await expect(firstRow).toContainText('Carla Sofia Neto')
  await expect(firstRow).toContainText('Confirmada')
})
