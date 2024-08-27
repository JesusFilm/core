export const queueName = 'api-videos-algolia'
export const jobName = `${queueName}-job`

const EVERY_DAY_AT_2_AM = '0 0 2 * * *'
export const repeat = EVERY_DAY_AT_2_AM
