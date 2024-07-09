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
    const nodeEnv = process.env.DOPPLER_ENVIRONMENT ?? ''

    if (apiKey === '' || appId === '') return

    const name = 'api-journeys-algolia'
    const repeatableJobs = await this.algoliaQueue.getRepeatableJobs()

    for (const job of repeatableJobs) {
      if (job.name === name) {
        await this.algoliaQueue.removeRepeatableByKey(job.key)
      }
    }

    const options =
      nodeEnv === 'prd' ? { repeat: { pattern: '0 0 0 * * *' } } : {}
    await this.algoliaQueue.add(name, {}, options)
  }
}
