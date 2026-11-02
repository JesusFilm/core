export const queueName = 'api-journeys-plausible-site-cleanup'
export const jobName = `${queueName}-job`

// Daily at 5:00 AM UTC, after the e2e (3:00) and anonymous journey (4:00)
// cleanups have hard-deleted the day's journeys.
const DAILY_5AM = '0 0 5 * * *'
export const repeat = DAILY_5AM
