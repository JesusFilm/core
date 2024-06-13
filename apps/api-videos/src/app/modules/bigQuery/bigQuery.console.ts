import { Queue } from 'bullmq'

export async function main(): Promise<void> {
  const myQueue = new Queue('api-videos-arclight', {
    connection: {
      host: process.env.REDIS_URL ?? 'redis',
      port: 6379
    }
  })
  const repeatableJobs = await myQueue.getRepeatableJobs()
  const name = 'api-videos-bq-ingest'
  for (const job of repeatableJobs) {
    if (job.name === name) {
      await myQueue.removeRepeatableByKey(job.key)
    }
  }
  await myQueue.add(name, {})
  process.exit(0)
}

void main()
