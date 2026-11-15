import { http, unwrap } from '@/shared/api/http'
import type { AuthResponse, Role, SuccessEnvelope, User } from '@/shared/contract/types'

export interface RegisterPayload {
  fullName: string
  nif: string
  email: string
  password: string
  role: Role
}

export const authApi = {
  login: (payload: { identifier: string; password: string }) =>
    unwrap(http.post<SuccessEnvelope<AuthResponse>>('/auth/login', payload)),
  register: (payload: RegisterPayload) =>
    unwrap(http.post<SuccessEnvelope<AuthResponse>>('/auth/register', payload)),
  me: () => unwrap(http.get<SuccessEnvelope<User>>('/auth/me')),
  logout: async (refreshToken: string) => {
    await http.post('/auth/logout', { refreshToken })
  },
}
