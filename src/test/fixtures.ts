import type { Booking, Service, User } from '@/shared/contract/types'

export const API = 'http://api.test/api/v1'

export const clientUser: User = {
  id: '11111111-1111-4111-8111-111111111111',
  fullName: 'Ana Paula Domingos',
  nif: '004512345LA041',
  email: 'ana.cliente@bulir.demo',
  role: 'CLIENT',
  balance: '10000.00',
  createdAt: '2026-11-13T10:00:00.000Z',
}

export const providerUser: User = {
  id: '22222222-2222-4222-8222-222222222222',
  fullName: 'Carla Sofia Neto',
  nif: '5417001234',
  email: 'carla.prestadora@bulir.demo',
  role: 'PROVIDER',
  balance: '0.00',
  createdAt: '2026-11-13T10:00:00.000Z',
}

export function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Corte de cabelo',
    description: 'Corte masculino ou feminino com lavagem incluída.',
    price: '5000.00',
    provider: { id: providerUser.id, fullName: providerUser.fullName },
    createdAt: '2026-11-13T10:00:00.000Z',
    updatedAt: '2026-11-13T10:00:00.000Z',
    ...overrides,
  }
}

export function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: '44444444-4444-4444-8444-444444444444',
    status: 'CONFIRMED',
    price: '5000.00',
    service: { id: makeService().id, name: 'Corte de cabelo' },
    client: { id: clientUser.id, fullName: clientUser.fullName },
    provider: { id: providerUser.id, fullName: providerUser.fullName },
    createdAt: '2026-11-14T10:00:00.000Z',
    cancelledAt: null,
    cancelledBy: null,
    ...overrides,
  }
}

export const ok = <T>(data: T, meta?: object) => ({
  success: true,
  data,
  ...(meta ? { meta } : {}),
})

export const page = <T>(items: T[]) =>
  ok(items, { page: 1, perPage: 20, total: items.length, totalPages: 1 })

export const apiError = (
  statusCode: number,
  code: string,
  message: string,
  errors: unknown[] = [],
) => ({
  success: false,
  statusCode,
  code,
  message,
  errors,
})
