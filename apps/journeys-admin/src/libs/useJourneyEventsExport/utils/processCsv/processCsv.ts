import { stringify } from 'csv-stringify/sync'
import { format } from 'date-fns'

import { JourneyEvent } from '../../useJourneyEventsExport'
import { EVENT_CSV_OPTIONS } from '../constants'

export function processCsv(
  eventData: JourneyEvent[],
  journeySlug: string
): void {
  const csv = stringify(eventData, EVENT_CSV_OPTIONS)
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
