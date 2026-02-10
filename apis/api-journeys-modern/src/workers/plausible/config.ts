export const queueName = 'api-journeys-plausible'
export const jobName = `${queueName}-job`

// Run a one-off backfill job on startup to mirror legacy behaviour
export const jobData = {
  __typename: 'plausibleCreateSites'
} as const
