import { Queue } from 'bullmq'

new Queue('api-languages-importer', {
  connection: {
    host: process.env.REDIS_URL ?? 'redis',
    port: 6379
  }
})
