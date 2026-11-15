import { cleanParams, http, unwrap, unwrapPage } from '@/shared/api/http'
import type { Booking, BookingListParams, SuccessEnvelope } from '@/shared/contract/types'

export const bookingsApi = {
  list: (params: BookingListParams) =>
    unwrapPage(http.get<SuccessEnvelope<Booking[]>>('/bookings', { params: cleanParams(params) })),
  create: (serviceId: string) =>
    unwrap(http.post<SuccessEnvelope<Booking>>('/bookings', { serviceId })),
  cancel: (id: string) => unwrap(http.patch<SuccessEnvelope<Booking>>(`/bookings/${id}/cancel`)),
}
