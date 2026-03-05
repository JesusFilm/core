import { parseISO } from 'date-fns'

import { earliestStatsCollected } from '../buildPresetDateRange'

/**
 * Returns the start of the day in UTC for a journey's createdAt value.
 * When createdAt is null or undefined, returns the earliest stats date so the minimum
 * selectable date for analytics is always defined (journey did not exist before that date).
 */
export function getJourneyStartDate(
  createdAt: string | Date | null | undefined
): Date {
  if (createdAt == null) return parseISO(earliestStatsCollected)
  const d =
    typeof createdAt === 'string' ? parseISO(createdAt) : new Date(createdAt)
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      0,
      0,
      0,
      0
    )
  )
}
