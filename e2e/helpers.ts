import { expect, type Page } from '@playwright/test'

/** Contas do seed da API (ver README da API). */
export const DEMO_PASSWORD = 'Senha@123'

export async function login(page: Page, identifier: string, password = DEMO_PASSWORD) {
  await page.goto('/login')
  await page.getByLabel('E-mail ou NIF').fill(identifier)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

/** Lê o saldo do badge da navbar e devolve-o em cêntimos (inteiro). */
export async function readBalanceCents(page: Page): Promise<number> {
  const badge = page.getByRole('link', { name: /Saldo atual/ })
  await expect(badge).toBeVisible()
  const text = (await badge.textContent()) ?? ''
  const digits = text.replace(/[^\d,]/g, '').replace(',', '')
  return Number(digits)
}
