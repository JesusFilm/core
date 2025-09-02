import { formatTime } from '../formatTime'

/**
 * Formats a TimeRanges object into a readable string with adjustments for a specific video section
 *
 * @param timeRanges - The TimeRanges object from the video player
 * @param startAt - The start time of the video section in seconds
 * @param endAt - The end time of the video section in seconds
 * @returns A formatted string representation of the time ranges (e.g., "0:05-1:20, 2:00-3:10")
 *
 * For trimmed videos, this function ensures time ranges are relative to the trimmed section.
 * Example: If a 9:00 video is trimmed to 5:00-6:14, ranges will be shown as 0:00-1:14
 * (not 5:00-6:14 or 0:00-9:00). All times are zeroed to the startAt position.
 */
export function formatTimeRanges(
  timeRanges: TimeRanges | null | undefined,
  startAt: number,
  endAt: number
): string {
  if (!timeRanges || timeRanges.length === 0) return '-'

  // Adjust and filter ranges relative to the specified video section
  return Array.from({ length: timeRanges.length }, (_, i) => i)
    .map((i) => {
      const rangeStart = timeRanges.start(i)
      const rangeEnd = timeRanges.end(i)

      // Skip ranges that are completely outside our video section
      if (rangeStart > endAt) return null
      if (rangeEnd < startAt) return null

      // Adjust start time relative to startAt and ensure it's not negative
      const start = Math.max(0, rangeStart - startAt)

      // Adjust end time relative to startAt and clamp to the video section
      const end = Math.min(endAt - startAt, rangeEnd - startAt)

      // Format as "start-end" string (e.g., "0:05-1:20")
      return `${formatTime(start)}-${formatTime(end)}`
    })
    .filter(Boolean) // Remove null entries (ranges outside our section)
    .join(', ')
}
