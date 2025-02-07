export const queueName = 'api-media-blocklist'
export const jobName = `${queueName}-job`

const EVERY_DAY_AT_2_AM = '0 0 3 * * *'
export const repeat = EVERY_DAY_AT_2_AM
