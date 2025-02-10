export const queueName = 'api-languages-algolia'
export const jobName = `${queueName}-job`

const EVERY_DAY_AT_3_AM = '0 0 3 * * *'
export const repeat = EVERY_DAY_AT_3_AM
