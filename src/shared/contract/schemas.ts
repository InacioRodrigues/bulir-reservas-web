import { z } from 'zod'
import { compareMoney, normalizeMoneyInput, toCents } from '@/shared/lib/money'

/**
 * Schemas zod com as MESMAS regras do contrato/backend. Validam no cliente para dar
 * feedback imediato; a API volta a validar tudo (a UI nunca é a única barreira).
 * Os inputs são strings (o que o utilizador escreve) e os outputs já vêm normalizados
 * no formato que a API espera. Sem dependências de React → reaproveitáveis no mobile.
 */

export const LIMITS = {
  fullName: { min: 3, max: 120 },
  password: { min: 8, max: 128 },
  email: { max: 255 },
  service: {
    name: { min: 3, max: 100 },
    description: { min: 10, max: 1000 },
    priceMax: '10000000.00',
  },
  topUpMax: '1000000.00',
  searchMax: 100,
} as const

const MONEY_INPUT = /^\d{1,13}(\.\d{1,2})?$/
const NIF_PATTERN = /^[A-Z0-9]{9,14}$/

export const normalizeNif = (nif: string) => nif.replace(/\s+/g, '').toUpperCase()
export const normalizeEmail = (email: string) => email.trim().toLowerCase()

/** Campo monetário: aceita "1 500,5" e devolve "1500.5" (a API formata com 2 casas). */
export function moneyField(label: string, max: string) {
  return z
    .string()
    .transform(normalizeMoneyInput)
    .pipe(
      z
        .string()
        .min(1, `Indique o ${label}`)
        .regex(MONEY_INPUT, `O ${label} deve ser um número com até 2 casas decimais`)
        .refine((value) => toCents(value) > 0n, `O ${label} deve ser maior que 0`)
        .refine(
          (value) => compareMoney(value, max) <= 0,
          `O ${label} não pode ultrapassar ${Number(max).toLocaleString('pt-AO')} Kz`,
        ),
    )
}

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Indique o e-mail ou o NIF')
    .max(LIMITS.email.max, 'Identificador demasiado longo'),
  password: z.string().min(1, 'Indique a senha').max(LIMITS.password.max, 'Senha demasiado longa'),
})

export const roleSchema = z.enum(['CLIENT', 'PROVIDER'], { error: 'Escolha o tipo de conta' })

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(LIMITS.fullName.min, `O nome deve ter pelo menos ${LIMITS.fullName.min} caracteres`)
      .max(LIMITS.fullName.max, `O nome deve ter no máximo ${LIMITS.fullName.max} caracteres`),
    nif: z
      .string()
      .transform(normalizeNif)
      .pipe(z.string().regex(NIF_PATTERN, 'O NIF deve ter 9 a 14 letras ou dígitos')),
    email: z
      .string()
      .transform(normalizeEmail)
      .pipe(
        z
          .email('E-mail inválido')
          .max(LIMITS.email.max, `O e-mail deve ter no máximo ${LIMITS.email.max} caracteres`),
      ),
    password: z
      .string()
      .min(LIMITS.password.min, `A senha deve ter pelo menos ${LIMITS.password.min} caracteres`)
      .max(LIMITS.password.max, `A senha deve ter no máximo ${LIMITS.password.max} caracteres`)
      .regex(/[A-Za-z]/, 'A senha deve conter pelo menos uma letra')
      .regex(/\d/, 'A senha deve conter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    role: roleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  })

export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      LIMITS.service.name.min,
      `O título deve ter pelo menos ${LIMITS.service.name.min} caracteres`,
    )
    .max(
      LIMITS.service.name.max,
      `O título deve ter no máximo ${LIMITS.service.name.max} caracteres`,
    ),
  description: z
    .string()
    .trim()
    .min(
      LIMITS.service.description.min,
      `A descrição deve ter pelo menos ${LIMITS.service.description.min} caracteres`,
    )
    .max(
      LIMITS.service.description.max,
      `A descrição deve ter no máximo ${LIMITS.service.description.max} caracteres`,
    ),
  price: moneyField('preço', LIMITS.service.priceMax),
})

export const topUpSchema = z.object({
  amount: moneyField('valor', LIMITS.topUpMax),
})

/** Filtro de preço opcional do catálogo (vazio = sem filtro). */
const optionalPrice = z
  .string()
  .transform(normalizeMoneyInput)
  .pipe(z.union([z.literal(''), z.string().regex(MONEY_INPUT, 'Valor inválido')]))

export const priceRangeSchema = z
  .object({ minPrice: optionalPrice, maxPrice: optionalPrice })
  .refine(
    ({ minPrice, maxPrice }) => !minPrice || !maxPrice || compareMoney(minPrice, maxPrice) <= 0,
    { path: ['maxPrice'], message: 'O máximo deve ser maior ou igual ao mínimo' },
  )

export type LoginInput = z.input<typeof loginSchema>
export type LoginValues = z.output<typeof loginSchema>
export type RegisterInput = z.input<typeof registerSchema>
export type RegisterValues = z.output<typeof registerSchema>
export type ServiceInput = z.input<typeof serviceSchema>
export type ServiceValues = z.output<typeof serviceSchema>
export type TopUpInput = z.input<typeof topUpSchema>
export type TopUpValues = z.output<typeof topUpSchema>
export type PriceRangeInput = z.input<typeof priceRangeSchema>
