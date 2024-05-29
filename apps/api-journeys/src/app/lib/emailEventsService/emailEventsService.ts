import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { EventsNotificationJob } from '../../modules/event/email/email.consumer'

@Injectable()
export class EmailEventsService {
  constructor(
    @InjectQueue('api-journeys-events-email')
    private readonly emailQueue: Queue<EventsNotificationJob>
  ) {}

  async sendAnalyticsEmail(
    journeyId: string,
    visitorId: string,
    userId: string
  ): Promise<void> {
    const jobId = `visitor-event-${journeyId}-${visitorId}`
    const visitorEmailJob = await this.emailQueue.getJob(jobId)
    const delay = 5 * 60 * 1000

    if (visitorEmailJob != null) await this.emailQueue.remove(jobId)

    await this.emailQueue.add(
      'visitor-event',
      {
        journeyId,
        visitorId,
        userId
      },
      { jobId }
    )
  }
}
