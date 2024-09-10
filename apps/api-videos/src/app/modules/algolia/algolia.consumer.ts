import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'

import { AlgoliaService } from './algolia.service'

@Processor('api-videos-algolia')
export class AlgoliaConsumer extends WorkerHost {
  private readonly logger = new Logger(AlgoliaConsumer.name)
  constructor(private readonly algoliaService: AlgoliaService) {
    super()
  }

  async process(): Promise<void> {
    this.logger.log('Syncing videos to Algolia')
    await this.algoliaService.syncVideosToAlgolia()
  }
}
