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

    if (hash === '') {
      console.log('no hash')
      return
    }

    const name = 'api-videos-crowdin'

    await this.crowdinQueue.add(name, {})
  }
}
