export const queueName = 'api-media-production-manager-video-slack-summary'
export const jobName = queueName + '-job'

// BullMQ repeat cron runs in UTC here. 14:00 UTC is 10 AM Eastern during
// daylight saving time and 9 AM Eastern during standard time.
const EVERY_DAY_AT_14_UTC = '0 0 14 * * *'
export const repeat = EVERY_DAY_AT_14_UTC
