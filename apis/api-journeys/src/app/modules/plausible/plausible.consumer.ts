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

interface PlausibleCreateTemplateSiteJob {
  __typename: 'plausibleCreateTemplateSite'
  templateId: string
}

interface PlausibleCreateSitesJob {
  __typename: 'plausibleCreateSites'
}

export type PlausibleJob =
  | PlausibleCreateTeamSiteJob
  | PlausibleCreateJourneySiteJob
  | PlausibleCreateTemplateSiteJob
  | PlausibleCreateSitesJob

@Processor('api-journeys-plausible')
export class PlausibleConsumer extends WorkerHost {
  constructor(private readonly plausibleService: PlausibleService) {
    super()
  }

  async process(job: Job<PlausibleJob>): Promise<void> {
    switch (job.data.__typename) {
      case 'plausibleCreateSites':
        await this.plausibleService.createSites()
        break
      case 'plausibleCreateTeamSite':
        await this.plausibleService.createTeamSite(job.data)
        break
      case 'plausibleCreateJourneySite':
        await this.plausibleService.createJourneySite(job.data)
        break
      case 'plausibleCreateTemplateSite':
        await this.plausibleService.createTemplateSite(job.data)
        break
    }
  }
}
