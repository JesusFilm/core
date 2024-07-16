import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { WordPressService } from './wordpress.service'

@Processor('api-tags-wordpress')
export class WordPressConsumer extends WorkerHost {
  constructor(private readonly wordpressService: WordPressService) {
    super()
  }

  async process(job: Job): Promise<void> {
    await this.wordpressService.syncTagsToWordPress()
  }
}
