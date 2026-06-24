/**
 * Format a Date as YYYY-MM-DD for a specific IANA timezone.
 */
export function formatDateYmdInTimeZone(date: Date, timeZone: string): string {
  try {
    return date.toLocaleDateString('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

/**
 * Convert a wall-clock datetime in a specific IANA timezone into a UTC Date.
 * If the input has an explicit offset (e.g., ends with 'Z' or '+05:00'), it is parsed as-is.
 * Otherwise, it is interpreted as local wall time in the provided timezone and converted to UTC.
 */
export function parseDateInTimeZoneToUtc(
  input: string | Date,
  timeZone: string
): Date {
  const hasExplicitOffset = (str: string): boolean =>
    /([zZ]|[+-]\d{2}:?\d{2})$/.test(str)

  if (input instanceof Date) return input
  if (typeof input !== 'string' || input.trim() === '') return new Date(NaN)

  const trimmed = input.trim()
  if (hasExplicitOffset(trimmed)) return new Date(trimmed)

  // Build an initial UTC guess by treating the wall time as if it were UTC
  // Then compute the timezone offset at that instant and adjust
  const initial = new Date(`${trimmed}Z`)

  const getTimeZoneOffsetMs = (instant: Date, tz: string): number => {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    const parts = dtf.formatToParts(instant)
    const map: Record<string, string> = {}
    for (const p of parts) map[p.type] = p.value
    const isoLocal = `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}.000Z`
    const asUtcMs = Date.parse(isoLocal)
    return asUtcMs - instant.getTime()
  }

  try {
    const offset1 = getTimeZoneOffsetMs(initial, timeZone)
    let utcMs = initial.getTime() - offset1
    // Recompute once to handle DST transitions precisely
    const offset2 = getTimeZoneOffsetMs(new Date(utcMs), timeZone)
    if (offset2 !== offset1) {
      utcMs = initial.getTime() - offset2
    }
    return new Date(utcMs)
  } catch (err) {
    if (err instanceof RangeError) {
      return initial
    }
    throw err
  }
}
