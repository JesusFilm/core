import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class AlgoliaQueue implements OnModuleInit {
  constructor(
    @InjectQueue('api-videos-aloglia') private readonly algoliaQueue: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    const apiKey = process.env.ALGOLIA_API_KEY ?? ''
    const nodeEnv = process.env.NODE_ENV ?? ''
    if (apiKey === '' || nodeEnv !== 'production') return

    const name = 'api-videos-aloglia'
    const repeatableJobs = await this.algoliaQueue.getRepeatableJobs()

    for (const job of repeatableJobs) {
      if (job.name === name) {
        await this.algoliaQueue.removeRepeatableByKey(job.key)
      }
    }

    // Schedule a new instance
    await this.algoliaQueue.add(
      name,
      {},
      {
        repeat: {
          pattern: '0 0 0 * * *' // Run every day at midnight
        }
      }
    )
  }
}
