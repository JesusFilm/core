import { Queue } from 'bullmq'

export async function main(): Promise<void> {
  const myQueue = new Queue('api-videos-crowdin', {
    connection: {
      host: process.env.REDIS_URL ?? 'redis',
      port: 6379
    }
  })

  const repeatableJobs = await myQueue.getRepeatableJobs()
  const name = 'api-videos-crowdin'
  for (const job of repeatableJobs) {
    if (job.name === name) {
      await myQueue.removeRepeatableByKey(job.key)
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
