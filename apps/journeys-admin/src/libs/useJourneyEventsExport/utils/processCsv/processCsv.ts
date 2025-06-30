import { stringify } from 'csv-stringify/sync'
import { format } from 'date-fns'
import { TFunction } from 'i18next'

import { JourneyEvent } from '../../useJourneyEventsExport'
import { getTranslatedCsvOptions } from '../constants'

export function processCsv(
  eventData: JourneyEvent[],
  journeySlug: string,
  t: TFunction
): void {
  const csv = stringify(eventData, getTranslatedCsvOptions(t))
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const today = format(new Date(), 'yyyy-MM-dd')
  const fileName = `[${today}] ${journeySlug}.csv`
  const link = document.createElement('a')

  link.target = '_blank'
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
