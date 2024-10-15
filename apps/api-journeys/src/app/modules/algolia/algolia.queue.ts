import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class AlgoliaQueue implements OnModuleInit {
  constructor(
    @InjectQueue('api-journeys-algolia') private readonly algoliaQueue: Queue
  ) {}

  async onModuleInit() {
    const apiKey = process.env.ALGOLIA_API_KEY ?? ''
    const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
    const nodeEnv = process.env.NODE_ENV ?? ''

    if (apiKey === '' || appId === '' || nodeEnv !== 'production') return

    const name = 'api-journeys-algolia'
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
          pattern: '0 0 1 * * *' // Run every day at 1 in the morning
        }
      }
    )
  }
}
