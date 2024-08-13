import { Queue } from 'bullmq'

export const queueName = 'api-users-email'

export const bullConnection = {
  host: process.env.REDIS_URL ?? 'redis',
  port: 6379
}

export const emailQueue = new Queue(queueName, {
  connection: bullConnection
})
