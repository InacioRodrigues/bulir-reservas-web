/**
 * Tipos do contrato da API (CONTRATO-API.md). Sem dependências de React ou do browser,
 * para poderem ser partilhados com a app mobile.
 *
 * Dinheiro trafega SEMPRE como string decimal com 2 casas ("1500.00"), nunca como number.
 */

export type Role = 'CLIENT' | 'PROVIDER'
export type BookingStatus = 'CONFIRMED' | 'CANCELLED'
export type TransactionType =
  'TOP_UP' | 'BOOKING_DEBIT' | 'BOOKING_CREDIT' | 'REFUND_CREDIT' | 'REFUND_DEBIT'

/** String decimal com 2 casas, ex.: "1500.00". Débitos no ledger vêm com sinal: "-1500.00". */
export type Money = string
/** Data ISO 8601 em UTC. */
export type IsoDate = string

export interface User {
  id: string
  fullName: string
  nif: string
  email: string
  role: Role
  balance: Money
  createdAt: IsoDate
}

export interface PersonRef {
  id: string
  fullName: string
}

export interface Service {
  id: string
  name: string
  description: string
  price: Money
  provider: PersonRef
  createdAt: IsoDate
  updatedAt: IsoDate
}

export interface Booking {
  id: string
  status: BookingStatus
  /** Preço congelado no momento da reserva. */
  price: Money
  /** Nome do serviço congelado (snapshot). */
  service: { id: string; name: string }
  client: PersonRef
  provider: PersonRef
  createdAt: IsoDate
  cancelledAt: IsoDate | null
  cancelledBy: Role | null
}

export interface Transaction {
  id: string
  type: TransactionType
  /** Com sinal: créditos positivos, débitos negativos. */
  amount: Money
  balanceAfter: Money
  bookingId: string | null
  createdAt: IsoDate
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends AuthTokens {
  user: User
}

export interface PageMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  items: T[]
  meta: PageMeta
}

export interface PageParams {
  page?: number
  perPage?: number
}

export type ServiceSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc'

export interface ServiceListParams extends PageParams {
  search?: string
  minPrice?: Money
  maxPrice?: Money
  sort?: ServiceSort
}

export interface BookingListParams extends PageParams {
  status?: BookingStatus
}

/** Envelope de sucesso devolvido pela API. */
export interface SuccessEnvelope<T> {
  success: true
  message?: string
  data: T
  meta?: PageMeta
}

export interface FieldError {
  field: string
  message: string
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'NIF_ALREADY_EXISTS'
  | 'INSUFFICIENT_BALANCE'
  | 'BOOKING_ALREADY_CANCELLED'
  | 'PROVIDER_INSUFFICIENT_BALANCE'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_SERVER_ERROR'

/** Envelope de erro devolvido pela API (GlobalExceptionFilter). */
export interface ErrorEnvelope {
  success: false
  statusCode: number
  code: ErrorCode | (string & {})
  message: string
  errors: FieldError[]
  path?: string
  timestamp?: IsoDate
  correlationId?: string
}
