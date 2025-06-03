export const queueName = 'api-media-video-children'
export const jobName = `${queueName}-job`

const EVERY_DAY_AT_1_AM = '0 0 1 * * *'
export const repeat = EVERY_DAY_AT_1_AM
