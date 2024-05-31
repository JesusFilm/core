import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { EventsNotificationJob } from './email.consumer'

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('api-journeys-events-email')
    private readonly emailQueue: Queue<EventsNotificationJob>
  ) {}

  // Don't send email if user is watching video
  async sendEventsEmail(journeyId: string, visitorId: string): Promise<void> {
    const jobId = `visitor-event-${journeyId}-${visitorId}`
    const visitorEmailJob = await this.emailQueue.getJob(jobId)
    const delay = 2 * 60 * 1000

    if (visitorEmailJob != null) {
      await this.emailQueue.remove(jobId)
      await this.emailQueue.add(
        'visitor-event',
        {
          journeyId,
          visitorId
        },
        { jobId, delay }
      )
    } else {
      await this.emailQueue.add(
        'visitor-event',
        {
          journeyId,
          visitorId
        },
        { jobId, delay }
      )
    }
  }
}
