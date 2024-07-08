import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { AlgoliaService } from './algolia.service'

@Processor('api-journeys-algolia')
export class AlgoliaConsumer extends WorkerHost {
  constructor(private readonly algoliaService: AlgoliaService) {
    super()
  }

  async process(job: Job): Promise<void> {
    await this.algoliaService.syncJourneysToAlgolia()
  }
}
