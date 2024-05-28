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
    const jobId = `visitor-event-${journeyId}`
    const visitorEmailJob = await this.emailQueue.getJob(jobId)
    const delay = 24 * 3600 * 1000

    if (visitorEmailJob != null) {
      const visitorExists = visitorEmailJob?.data?.visitors?.includes(visitorId)

      // TODO: check if actually gets updated
      if (visitorExists !== true)
        await visitorEmailJob.updateData({ visitors: [visitorId] })
    } else {
      await this.emailQueue.add(
        'visitor-email',
        {
          visitors: [visitorId]
        },
        { delay, jobId }
      )
    }
  }
}
