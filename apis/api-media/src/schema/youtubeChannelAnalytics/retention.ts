/**
 * How long Core keeps a YouTube Analytics figure, counted from when Wheat
 * fetched it. YouTube API Services policy allows 30 days; 28 leaves room for
 * the nightly sweep. A row crosses 28 days at most a day before the next run
 * deletes it, so it is gone by day 29, or by day 30 if one night's run fails.
 */
export const YOUTUBE_ANALYTICS_RETENTION_DAYS = 28

const ONE_DAY_MS = 86_400_000

/**
 * Rows fetched at or before this instant are past the 28-day clock: no read
 * returns them, no write accepts them, and the nightly worker deletes them.
 */
export function youtubeAnalyticsCutoff(now: Date): Date {
  return new Date(now.getTime() - YOUTUBE_ANALYTICS_RETENTION_DAYS * ONE_DAY_MS)
}
