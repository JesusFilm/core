import { stringify } from 'csv-stringify/sync'
import { format } from 'date-fns'
import { TFunction } from 'i18next'

import { JourneyContact } from '../../useJourneyEventsExport'

export function getContactsCsvOptions(t: TFunction, contactDataFields: string[]) {
  const allColumns = [
    { key: 'visitorName', header: t('Name') },
    { key: 'visitorEmail', header: t('Email') },
    { key: 'visitorPhone', header: t('Phone') }
  ]

  // Filter columns based on selected contact data fields
  const filteredColumns = allColumns.filter(column => {
    const fieldMap: Record<string, string> = {
      'name': 'visitorName',
      'email': 'visitorEmail', 
      'phone': 'visitorPhone'
    }
    return contactDataFields.some(field => fieldMap[field] === column.key)
  })

  return {
    header: true,
    columns: filteredColumns
  }
}

export function processContactsCsv(
  contacts: JourneyContact[],
  journeySlug: string,
  t: TFunction,
  contactDataFields: string[]
): void {
  const csv = stringify(contacts, getContactsCsvOptions(t, contactDataFields))
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const today = format(new Date(), 'yyyy-MM-dd')
  const fileName = `[${today}] ${journeySlug}_contacts.csv`
  const link = document.createElement('a')

  link.target = '_blank'
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
