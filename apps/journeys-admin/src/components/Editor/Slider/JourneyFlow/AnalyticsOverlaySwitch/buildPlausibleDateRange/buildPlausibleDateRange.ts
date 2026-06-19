import { formatISO } from 'date-fns'

export function buildPlausibleDateRange(
  startDate: Date | null,
  endDate: Date | null,
  fallbackStartDate: string,
  fallbackEndDate: Date
): string {
  if (startDate != null && endDate != null && startDate <= endDate) {
    return `${formatISO(startDate, {
      representation: 'date'
    })},${formatISO(endDate, { representation: 'date' })}`
  }

  return `${fallbackStartDate},${formatISO(fallbackEndDate, {
    representation: 'date'
  })}`
}
