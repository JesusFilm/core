import { Queue } from 'bullmq'

export interface PlausibleJob {
  __typename: 'plausibleCreateJourneySite' | 'plausibleCreateTeamSite'
  journeyId?: string
  teamId?: string
}

export class PlausibleQueueService {
  private readonly queue: Queue<PlausibleJob>

  constructor() {
    this.queue = new Queue<PlausibleJob>('api-journeys-modern-plausible')
  }

  async add(
    name: string,
    data: PlausibleJob,
    options?: {
      removeOnComplete?: boolean | number
      removeOnFail?: boolean | number | { age: number; count: number }
    }
  ): Promise<void> {
    await this.queue.add(name, data, options)
  }
}
