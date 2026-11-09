export const queueName = 'api-media-video-label-consistency'
export const jobName = `${queueName}-job`

// BullMQ repeat cron runs in UTC here.
const EVERY_DAY_AT_15_UTC = '0 0 15 * * *'
export const repeat = EVERY_DAY_AT_15_UTC
