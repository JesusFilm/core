import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { PlausibleService } from './plausible.service'

interface PlausibleCreateTeamSiteJob {
  __typename: 'plausibleCreateTeamSite'
  teamId: string
}

interface PlausibleCreateJourneySiteJob {
  __typename: 'plausibleCreateJourneySite'
  journeyId: string
}

export type PlausibleJob =
  | PlausibleCreateTeamSiteJob
  | PlausibleCreateJourneySiteJob

@Processor('api-journeys-plausible')
export class PlausibleConsumer extends WorkerHost {
  constructor(private readonly plausibleService: PlausibleService) {
    super()
  }

  async process(job: Job<PlausibleJob>): Promise<void> {
    switch (job.data.__typename) {
      case 'plausibleCreateTeamSite':
        await this.plausibleService.createTeamSite(job.data)
        break
      case 'plausibleCreateJourneySite':
        await this.plausibleService.createJourneySite(job.data)
        break
    }
  }
}
