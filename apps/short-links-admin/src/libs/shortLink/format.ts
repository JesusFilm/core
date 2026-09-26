/** GraphQL DateTime scalars arrive untyped; accept anything Date can parse. */
export type DateLike = unknown

function toDate(value: DateLike): Date | undefined {
  if (value == null || value === '') return undefined
  const date =
    value instanceof Date
      ? value
      : typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : undefined
  if (date == null || Number.isNaN(date.getTime())) return undefined
  return date
}

export function formatDateTime(value: DateLike): string {
  const date = toDate(value)
  if (date == null) return ''

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function formatDate(value: DateLike): string {
  const date = toDate(value)
  if (date == null) return ''

  return date.toISOString().slice(0, 10)
}

export function toDateInputValue(value: DateLike): string {
  return formatDate(value)
}

export function fromDateInputValue(value: string): string | null {
  if (value.trim() === '') return null
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function lastThirtyDays(now: Date = new Date()): {
  from: string
  to: string
} {
  const to = new Date(now)
  const from = new Date(now)
  from.setUTCDate(from.getUTCDate() - 30)
  from.setUTCHours(0, 0, 0, 0)

  return { from: from.toISOString(), to: to.toISOString() }
}

export function toIsoString(value: DateLike): string | undefined {
  return toDate(value)?.toISOString()
}

export function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}
