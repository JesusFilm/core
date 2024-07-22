import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class BigQueryQueue implements OnModuleInit {
  constructor(
    @InjectQueue('api-videos-arclight') private readonly bigQueryQueue: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    const apiKey = process.env.BIG_QUERY_APPLICATION_JSON ?? ''
    const nodeEnv = process.env.NODE_ENV ?? ''
    if (apiKey === '' || nodeEnv !== 'production') return

    const name = 'api-videos-bq-ingest'
    const repeatableJobs = await this.bigQueryQueue.getRepeatableJobs()

    for (const job of repeatableJobs) {
      if (job.name === name) {
        await this.bigQueryQueue.removeRepeatableByKey(job.key)
      }
    }

    // Schedule a new instance
    await this.bigQueryQueue.add(
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
