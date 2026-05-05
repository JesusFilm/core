export const queueName = 'api-media-video-issues-summary'
export const jobName = `${queueName}-job`

const EVERY_DAY_AT_8_AM = '0 0 8 * * *'
export const repeat = EVERY_DAY_AT_8_AM
