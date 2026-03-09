import { GoogleSheetsSyncItem } from '../types'

export function getStartedByLabel(sync: GoogleSheetsSyncItem): string {
  if (sync.integration?.__typename === 'IntegrationGoogle') {
    return sync.integration.accountEmail ?? sync.email ?? 'N/A'
  }
  if (sync.email != null && sync.email !== '') return sync.email
  return 'N/A'
}

export function getSpreadsheetUrl(sync: GoogleSheetsSyncItem): string | null {
  if (sync.spreadsheetId == null || sync.spreadsheetId === '') return null
  return `https://docs.google.com/spreadsheets/d/${sync.spreadsheetId}`
}

