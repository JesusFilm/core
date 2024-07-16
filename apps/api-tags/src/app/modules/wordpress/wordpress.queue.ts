import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class WordPressQueue implements OnModuleInit {
  constructor(
    @InjectQueue('api-tags-wordpress') private readonly wordpressQueue: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    const applicationPassword = process.env.WORDPRESS_APPLICATION_PASSWORD ?? ''
    const user = process.env.WORDPRESS_USER ?? ''
    const nodeEnv = process.env.NODE_ENV ?? ''

    if (applicationPassword === '' || user === '' || nodeEnv !== 'production')
      return

    // only run the job if a new tag gets created
    const newTag = null

    const name = 'api-tags-wordpress'
    const repeatableJobs = await this.wordpressQueue.getRepeatableJobs()

    for (const job of repeatableJobs) {
      if (job.name === name) {
        await this.wordpressQueue.removeRepeatableByKey(job.key)
      }
    }

    console.log('wordpress queue initialized')
    if (newTag != null) {
      console.log('new tag created, adding to queue')
      await this.wordpressQueue.add(name, {})
    }
  }
}
