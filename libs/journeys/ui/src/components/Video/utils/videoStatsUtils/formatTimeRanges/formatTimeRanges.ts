import { formatTime } from '../formatTime'

/**
 * Formats a TimeRanges object into a readable string
 * @param timeRanges The TimeRanges object to format
 * @returns A string representation of the time ranges
 */
export function formatTimeRanges(timeRanges?: TimeRanges | null): string {
  if (!timeRanges || timeRanges.length === 0) return '-'

  const ranges = []
  for (let i = 0; i < timeRanges.length; i++) {
    ranges.push(
      `${formatTime(timeRanges.start(i))}-${formatTime(timeRanges.end(i))}`
    )
  }
  return ranges.join(', ')
}
