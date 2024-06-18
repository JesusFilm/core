import { Queue } from 'bullmq'

export async function main(): Promise<void> {
  const myQueue = new Queue('api-videos-crowdin', {
    connection: {
      host: process.env.REDIS_URL ?? 'redis',
      port: 6379
    }
  })

  await myQueue.add('api-videos-crowdin', {
    some: 'data'
  })

  console.log('Job added')
  process.exit(0)
}

void main()
