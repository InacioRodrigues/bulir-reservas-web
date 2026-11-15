import { cleanParams, http, unwrap, unwrapPage } from '@/shared/api/http'
import type {
  Money,
  PageParams,
  Service,
  ServiceListParams,
  SuccessEnvelope,
} from '@/shared/contract/types'

export interface ServicePayload {
  name: string
  description: string
  /** Sempre string — um number JSON dá 400 na API. */
  price: Money
}

export const servicesApi = {
  catalog: (params: ServiceListParams) =>
    unwrapPage(http.get<SuccessEnvelope<Service[]>>('/services', { params: cleanParams(params) })),
  mine: (params: PageParams) =>
    unwrapPage(
      http.get<SuccessEnvelope<Service[]>>('/services/mine', { params: cleanParams(params) }),
    ),
  get: (id: string) => unwrap(http.get<SuccessEnvelope<Service>>(`/services/${id}`)),
  create: (payload: ServicePayload) =>
    unwrap(http.post<SuccessEnvelope<Service>>('/services', payload)),
  update: (id: string, payload: Partial<ServicePayload>) =>
    unwrap(http.patch<SuccessEnvelope<Service>>(`/services/${id}`, payload)),
  remove: async (id: string) => {
    await http.delete(`/services/${id}`)
  },
}
