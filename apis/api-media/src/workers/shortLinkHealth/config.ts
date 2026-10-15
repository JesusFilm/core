export const queueName = 'api-media-short-link-health'
export const jobName = `${queueName}-job`

const EVERY_HOUR = '0 0 * * * *'
export const repeat = EVERY_HOUR
