export const queueName = 'api-journeys-shortlink-updater'
export const jobName = `${queueName}-job`

// Run every 3 hours to check and update all shortlinks
const EVERY_THREE_HOURS = '0 0 */3 * * *'
export const repeat = EVERY_THREE_HOURS

// The job's __typename keeps the old spelling: it is persisted with every
// queued and repeat job in Redis, and `service` would skip a job whose
// __typename it no longer matches.
export const jobData = {
  __typename: 'updateAllShortlinks'
} as const
