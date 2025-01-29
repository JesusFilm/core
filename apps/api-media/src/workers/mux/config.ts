export const queueName = 'api-media-mux'
export const jobName = `${queueName}-job`

const EVERY_FOUR_HOURS = '0 30 */4 * * *'
export const repeat = EVERY_FOUR_HOURS
