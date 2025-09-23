import { stringify } from 'csv-stringify/sync'
import { format } from 'date-fns'
import { TFunction } from 'i18next'

import { JourneyContact } from '../../useJourneyContactsExport'

// Import the shared validation function
function hasValidContactData(
  contact: JourneyContact,
  contactDataFields: string[]
): boolean {
  const fieldMap: Record<string, keyof JourneyContact> = {
    name: 'visitorName',
    email: 'visitorEmail',
    phone: 'visitorPhone'
  }

  const isValid = contactDataFields.some((field) => {
    const contactField = fieldMap[field]
    const value = contact[contactField]
    const hasValue = value != null && String(value).trim() !== ''
    console.log(`Field ${field} (${contactField}):`, { value, hasValue })
    return hasValue
  })

  console.log('Contact validation result:', { contact, contactDataFields, isValid })
  return isValid
}

export function getContactsCsvOptions(
  t: TFunction,
  contactDataFields: string[]
) {
  const allColumns = [
    { key: 'visitorName', header: t('Name') },
    { key: 'visitorEmail', header: t('Email') },
    { key: 'visitorPhone', header: t('Phone') }
  ]

  // Filter columns based on selected contact data fields
  const filteredColumns = allColumns.filter((column) => {
    const fieldMap: Record<string, string> = {
      name: 'visitorName',
      email: 'visitorEmail',
      phone: 'visitorPhone'
    }
    return contactDataFields.some((field) => fieldMap[field] === column.key)
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
  console.log('Processing contacts CSV:', {
    totalContacts: contacts.length,
    contactDataFields,
    journeySlug
  })

  // Filter out contacts that don't have meaningful data for the selected fields
  const validContacts = contacts.filter((contact) =>
    hasValidContactData(contact, contactDataFields)
  )

  console.log('Valid contacts after filtering:', validContacts.length)

  if (validContacts.length === 0) {
    console.error('No valid contacts found. Sample contact:', contacts[0])
    throw new Error(t('No contacts found with data for the selected fields'))
  }

  const csv = stringify(
    validContacts,
    getContactsCsvOptions(t, contactDataFields)
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
