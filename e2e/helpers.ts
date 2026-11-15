import { expect, type Page } from '@playwright/test'

export async function loginWithDemo(page: Page, account: RegExp) {
  await page.goto('/login')
  await page.getByRole('button', { name: account }).click()
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
