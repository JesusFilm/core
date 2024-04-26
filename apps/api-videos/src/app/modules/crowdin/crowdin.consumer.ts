import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { CrowdinService } from './crowdin.service'

@Processor('api-videos-crowdin')
export class CrowdinConsumer extends WorkerHost {
  constructor(private readonly crowdinService: CrowdinService) {
    super()
  }

  async process(job: Job): Promise<void> {
    console.log(job.name)
    await this.crowdinService.getCrowdinTranslations()
  }
}
