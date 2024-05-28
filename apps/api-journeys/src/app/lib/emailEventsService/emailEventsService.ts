import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class EmailEventsService {
  constructor(
    @InjectQueue('api-journeys-analytics-activity')
    private readonly emailQueue: Queue
  ) {}

  async sendAnalyticsEmail(
    visitorId: string,
    journeyId: string
  ): Promise<void> {
    const jobId = `visitor-event-${journeyId}-${visitorId}`
    const visitorEmailJob = await this.emailQueue.getJob(jobId)
    const delay = 5 * 60 * 1000

    if (visitorEmailJob != null) {
      await this.emailQueue.remove(jobId)
    } else {
      await this.emailQueue.add(
        'visitor-event',
        {
          visitorId
        },
        { delay, jobId }
      )
    }
  }
}
