import { Queue } from 'bullmq'

export const queueName = 'api-languages-arclight'

export const bullConnection = {
  host: process.env.REDIS_URL ?? 'redis',
  port: 6379
}

export const importLanguagesQueue = new Queue(queueName, {
  connection: bullConnection
})
