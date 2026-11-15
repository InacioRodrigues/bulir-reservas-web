import type { IsoDate } from '@/shared/contract/types'

/** Datas da API vêm em UTC; mostramos na hora de Luanda (WAT, UTC+1). */
const TIME_ZONE = 'Africa/Luanda'

const dateFormatter = new Intl.DateTimeFormat('pt-AO', { dateStyle: 'medium', timeZone: TIME_ZONE })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-AO', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
})

export const formatDate = (iso: IsoDate) => dateFormatter.format(new Date(iso))
export const formatDateTime = (iso: IsoDate) => dateTimeFormatter.format(new Date(iso))
