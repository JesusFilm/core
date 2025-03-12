import { formatTime } from '../formatTime'

/**
 * Formats a TimeRanges object into a readable string
 * @param timeRanges The TimeRanges object to format
 * @returns A string representation of the time ranges
 */
export function formatTimeRanges(timeRanges?: TimeRanges | null): string {
  if (!timeRanges || timeRanges.length === 0) return '-'

  return Array.from({ length: timeRanges.length }, (_, i) => i)
    .map(
      (i) =>
        `${formatTime(timeRanges.start(i))}-${formatTime(timeRanges.end(i))}`
    )
    .join(', ')
}
