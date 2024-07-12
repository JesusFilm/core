import { Queue } from 'bullmq'

export const bullConnection = {
  host: process.env.REDIS_URL ?? 'redis',
  port: 6379
}

export const importLanguagesQueue = new Queue('api-languages-importer', {
  connection: bullConnection
})
