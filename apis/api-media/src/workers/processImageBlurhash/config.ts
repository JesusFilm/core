export const queueName = 'api-media-process-image-blurhash'
export const jobName = `${queueName}-job`

// Run once a day at 4am
const EVERY_DAY_AT_FOUR_AM = '0 0 4 * * *'
export const repeat = EVERY_DAY_AT_FOUR_AM
