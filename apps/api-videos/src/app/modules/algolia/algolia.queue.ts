import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class AlgoliaQueue implements OnModuleInit {
  private readonly logger = new Logger(AlgoliaQueue.name)

  constructor(
    @InjectQueue('api-videos-algolia') private readonly algoliaQueue: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    const apiKey = process.env.ALGOLIA_API_KEY ?? ''
    const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
    const appIndex = process.env.ALGOLIA_INDEX ?? ''
    const nodeEnv = process.env.NODE_ENV ?? ''
    if (
      apiKey === '' ||
      appId === '' ||
      appIndex === '' ||
      nodeEnv !== 'production'
    ) {
      this.logger.log(`Skipping adding Algolia sync job: ${nodeEnv}`)
      return
    }

    const name = 'api-videos-algolia'
    const repeatableJobs = await this.algoliaQueue.getRepeatableJobs()

    this.logger.log('Removing old Algolia sync job')
    for (const job of repeatableJobs) {
      if (job.name === name) {
        await this.algoliaQueue.removeRepeatableByKey(job.key)
      }
    }

    // Schedule a new instance
    this.logger.log('Scheduling new Algolia sync job')
    await this.algoliaQueue.add(name, {})
  }
}
