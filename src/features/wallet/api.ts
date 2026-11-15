import { cleanParams, http, unwrap, unwrapPage } from '@/shared/api/http'
import type { Money, PageParams, SuccessEnvelope, Transaction } from '@/shared/contract/types'

export const walletApi = {
  topUp: (amount: Money) =>
    unwrap(http.post<SuccessEnvelope<{ balance: Money }>>('/wallet/top-up', { amount })),
  transactions: (params: PageParams) =>
    unwrapPage(
      http.get<SuccessEnvelope<Transaction[]>>('/wallet/transactions', {
        params: cleanParams(params),
      }),
    ),
}
