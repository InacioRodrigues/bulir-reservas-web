import type { Money } from '@/shared/contract/types'

/**
 * Aritmética de dinheiro sem vírgula flutuante: tudo é convertido para cêntimos em BigInt.
 * O front nunca é a fonte de verdade do saldo (a API é); estas funções servem para
 * apresentar valores e fazer pré-verificações de UX (ex.: "saldo suficiente?").
 */

const MONEY_PATTERN = /^-?\d+(\.\d{1,2})?$/

export function isMoney(value: string): boolean {
  return MONEY_PATTERN.test(value)
}

export function toCents(value: Money): bigint {
  if (!isMoney(value)) throw new Error(`Valor monetário inválido: "${value}"`)
  const negative = value.startsWith('-')
  const [int = '0', frac = ''] = value.replace('-', '').split('.')
  const cents = BigInt(int) * 100n + BigInt(frac.padEnd(2, '0'))
  return negative ? -cents : cents
}

export function fromCents(cents: bigint): Money {
  const negative = cents < 0n
  const abs = negative ? -cents : cents
  const int = abs / 100n
  const frac = (abs % 100n).toString().padStart(2, '0')
  return `${negative ? '-' : ''}${int}.${frac}`
}

export function compareMoney(a: Money, b: Money): -1 | 0 | 1 {
  const diff = toCents(a) - toCents(b)
  return diff === 0n ? 0 : diff > 0n ? 1 : -1
}

export function subtractMoney(a: Money, b: Money): Money {
  return fromCents(toCents(a) - toCents(b))
}

export function addMoney(a: Money, b: Money): Money {
  return fromCents(toCents(a) + toCents(b))
}

/** Saldo igual ao preço é suficiente (regra do contrato). */
export function hasSufficientBalance(balance: Money, price: Money): boolean {
  return compareMoney(balance, price) >= 0
}

/** Normaliza o que o utilizador escreve ("1 500,5" → "1500.5") para o formato da API. */
export function normalizeMoneyInput(input: string): string {
  return input.trim().replace(/[\s ]/g, '').replace(',', '.')
}

const kzFormatter = new Intl.NumberFormat('pt-AO', {
  style: 'currency',
  currency: 'AOA',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formata em Kwanzas ("50 000,00 Kz"). Passa a string ao Intl (que aceita strings
 * decimais exatas), por isso valores grandes não perdem precisão.
 */
export function formatKz(value: Money, options: { signed?: boolean } = {}): string {
  const formatted = kzFormatter.format(value as Intl.StringNumericLiteral)
  if (options.signed && !value.startsWith('-') && toCents(value) !== 0n) return `+${formatted}`
  return formatted
}
