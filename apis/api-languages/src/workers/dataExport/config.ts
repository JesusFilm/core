export const queueName = 'api-languages-data-export'
export const jobName = `${queueName}-job`

// Run once a day at midnight
const EVERY_DAY_AT_MIDNIGHT = '0 0 0 * * *'
export const repeat = EVERY_DAY_AT_MIDNIGHT
