export const queueName = 'api-media-video-slack-summary'
export const jobName = `${queueName}-job`

const EVERY_MONDAY_AT_9_AM_UTC = '0 0 9 * * 1'
export const repeat = EVERY_MONDAY_AT_9_AM_UTC
