import { formatDateYmdInTimeZone } from './date'
import {
  type BaseColumnLabelResolver,
  type JourneyExportColumn
} from './headings'

export interface EventHeaderRecord {
  blockId: string | null
  label: string | null
}

function normalizeLabel(label: string | null | undefined): string {
  return (label ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * Normalize labels and deduplicate by blockId (keep only one label per block).
 * Keep the first non-empty label encountered for each blockId.
 */
export function buildNormalizedBlockHeadersFromEvents(
  headers: EventHeaderRecord[]
): Array<{ blockId: string; label: string }> {
  const headerMap = new Map<string, { blockId: string; label: string }>()

  headers
    .filter((header) => header.blockId != null)
    .forEach((header) => {
      const blockId = header.blockId!
      const normalized = normalizeLabel(header.label)
      if (normalized === '') return
      if (headerMap.has(blockId)) return
      headerMap.set(blockId, { blockId, label: normalized })
    })

  return Array.from(headerMap.values())
}

export function getDefaultBaseColumns(): JourneyExportColumn[] {
  return [
    { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
    { key: 'date', label: 'Date', blockId: null, typename: '' }
  ]
}

export function getDefaultBaseColumnLabelResolver(): BaseColumnLabelResolver {
  return ({ column, userTimezone }) => {
    if (column.key === 'visitorId') return 'Visitor ID'
    if (column.key === 'date') {
      return userTimezone !== 'UTC' && userTimezone !== ''
        ? `Date (${userTimezone})`
        : 'Date'
    }
    return column.label
  }
}

/**
 * Format a date string for Google Sheets to match the export format (YYYY-MM-DD in timezone).
 * If the ISO string cannot be parsed, fall back to the original string.
 */
export function formatGoogleSheetsDateFromIso(
  isoOrDate: string,
  timeZone: string
): string {
  const parsed = new Date(isoOrDate)
  if (isNaN(parsed.getTime())) return isoOrDate
  return formatDateYmdInTimeZone(parsed, timeZone)
}
