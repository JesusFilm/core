export const queueName = 'api-journeys-plausible'
export const jobName = `${queueName}-job`

// Run daily at 05:00 UTC to backfill missing Plausible sites
const DAILY_AT_FIVE_AM = '0 0 5 * * *'
export const repeat = DAILY_AT_FIVE_AM

export const jobData = {
  __typename: 'plausibleCreateSites'
} as const
