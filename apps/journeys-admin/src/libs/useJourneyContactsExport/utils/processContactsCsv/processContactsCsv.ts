import { stringify } from 'csv-stringify/sync'
import { format } from 'date-fns'
import { TFunction } from 'i18next'

import { FlattenedContact, JourneyContact } from '../../useJourneyContactsExport'

const FIELD_MAP: Record<string, keyof JourneyContact> = {
  name: 'visitorName',
  email: 'visitorEmail',
  phone: 'visitorPhone'
}

export function getContactsCsvOptions(
  t: TFunction,
  contactDataFields: string[],
  responseFieldKeys: string[] = [],
  responseFieldLabels: Map<string, string> = new Map()
) {
  const allColumns = [
    { key: 'visitorName', header: t('Name') },
    { key: 'visitorEmail', header: t('Email') },
    { key: 'visitorPhone', header: t('Phone') }
  ]

  // Filter columns based on selected contact data fields
  const filteredColumns = allColumns.filter((column) => {
    return contactDataFields.some((field) => FIELD_MAP[field] === column.key)
  })

  // Add response field columns if responseFields is selected
  if (contactDataFields.includes('responseFields')) {
    responseFieldKeys.forEach((fieldKey) => {
      const label = responseFieldLabels.get(fieldKey) || fieldKey.split('-', 2)[1]
      filteredColumns.push({
        key: `responseFields.${fieldKey}`,
        header: label
      })
    })
  }

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

  if (contacts.length === 0) {
      console.error('No valid contacts found for export')
    throw new Error(t('No contacts found with data for the selected fields'))
  }

  // Collect unique response field keys and labels directly from contacts
  const responseFieldKeys = new Set<string>()
  const responseFieldLabels = new Map<string, string>()
  
  if (contactDataFields.includes('responseFields')) {
    contacts.forEach((contact) => {
      if (contact.responseFields && contact.responseFieldLabels) {
        Object.keys(contact.responseFields).forEach((fieldKey) => {
          responseFieldKeys.add(fieldKey)
          const label = contact.responseFieldLabels?.[fieldKey]
          if (label) {
            responseFieldLabels.set(fieldKey, label)
          }
        })
      }
    })
  }

  const arrayResponseFieldKeys = Array.from(responseFieldKeys)

  // Flatten the contacts data for CSV export
  const flattenedContacts = contacts.map((contact) => {
    const flattened: FlattenedContact = {
      visitorName: contact.visitorName,
      visitorEmail: contact.visitorEmail,
      visitorPhone: contact.visitorPhone
    }

    // Add response fields as individual properties
    if (contactDataFields.includes('responseFields') && contact.responseFields) {
      arrayResponseFieldKeys.forEach((fieldKey) => {
        flattened[`responseFields.${fieldKey}`] = contact.responseFields![fieldKey] || ''
      })
    }

    return flattened
  })

  const csv = stringify(
    flattenedContacts,
    getContactsCsvOptions(t, contactDataFields, arrayResponseFieldKeys, responseFieldLabels)
  )
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
