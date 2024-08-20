import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class CrowdinQueue implements OnModuleInit {
  constructor(
    @InjectQueue('api-videos-crowdin') private readonly crowdinQueue: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    const hash = process.env.CROWDIN_DISTRIBUTION_HASH ?? ''
    const nodeEnv = process.env.NODE_ENV ?? ''

    if (hash === '' || nodeEnv !== 'production') return

    const name = 'api-videos-crowdin'
    const repeatableJobs = await this.crowdinQueue.getRepeatableJobs()

    for (const job of repeatableJobs) {
      if (job.name === name) {
        await this.crowdinQueue.removeRepeatableByKey(job.key)
      }
    }

    // Schedule a new instance
    await this.crowdinQueue.add(
      name,
      {},
      {
        repeat: {
          pattern: '0 0 2 * * *' // Run every day at 2am
        }
      }
    )
  }
}
