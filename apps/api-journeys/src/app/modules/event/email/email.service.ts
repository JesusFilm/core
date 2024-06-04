import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { EventsNotificationJob } from './email.consumer'

type VideoEvent = 'start' | 'play'

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('api-journeys-events-email')
    private readonly emailQueue: Queue<EventsNotificationJob>
  ) {}

  async addVisitorEvent(
    journeyId: string,
    visitorId: string,
    jobId: string
  ): Promise<void> {
    await this.emailQueue.add(
      'visitor-event',
      {
        journeyId,
        visitorId
      },
      {
        jobId,
        delay: 2 * 60 * 1000, // delay for 2 minutes
        removeOnComplete: true,
        removeOnFail: { age: 24 * 36000 } // keep up to 24 hours
      }
    )
  }

  async sendEventsEmail(
    journeyId: string,
    visitorId: string,
    videoEvent?: VideoEvent
  ): Promise<void> {
    const jobId = `visitor-event-${journeyId}-${visitorId}`
    const visitorEmailJob = await this.emailQueue.getJob(jobId)

    if (visitorEmailJob != null) {
      const removeJob = ['start', 'play', null, undefined].includes(videoEvent)
      const addJob = videoEvent !== 'start' && videoEvent !== 'play'

      if (removeJob) await this.emailQueue.remove(jobId)
      if (addJob) await this.addVisitorEvent(journeyId, visitorId, jobId)
    } else {
      await this.addVisitorEvent(journeyId, visitorId, jobId)
    }
  }
}
