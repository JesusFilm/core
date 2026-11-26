const TIMESTAMP_PATTERN = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/

/**
 * Strictly parses `H:MM:SS`/`HH:MM:SS` or `M:SS`/`MM:SS` into seconds.
 * Empty input yields `null`; anything malformed yields `undefined`.
 */
export function parseTimestamp(value: string): number | null | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return null

  const match = TIMESTAMP_PATTERN.exec(trimmed)
  if (match == null) return undefined

  const hours = match[1] == null ? 0 : Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  if (minutes > 59 || seconds > 59) return undefined

  return hours * 3600 + minutes * 60 + seconds
}
