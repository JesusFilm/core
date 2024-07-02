import { Queue } from 'bullmq'

export async function main(): Promise<void> {
  const myQueue = new Queue('api-videos-arclight', {
    connection: {
      host: process.env.REDIS_URL ?? 'redis',
      port: 6379
    }
  })
  const jobs = await myQueue.getJobs([
    'active',
    'waiting',
    'delayed',
    'completed'
  ])
  const name = 'api-videos-bq-ingest'
  // remove old jobs
  for (const job of jobs) {
    if (job.name === name) {
      await job.remove()
    }
  }
  await myQueue.add(
    name,
    {},
    {
      removeOnComplete: {
        age: 3600 // keep up to 1 hour
      },
      removeOnFail: {
        age: 24 * 3600 // keep up to 24 hours
      }
    }
  )
  process.exit(0)
}

void main()
