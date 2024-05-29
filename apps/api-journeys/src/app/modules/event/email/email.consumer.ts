import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { EmailService } from '@core/nest/common/email/emailService'

import { PrismaService } from '../../../lib/prisma.service'

export interface EventsNotificationJob {
  visitorId: string
  journeyId
}

export type ApiUsersJob = EventsNotificationJob

@Processor('api-journeys-events-email')
export class EmailConsumer extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService
  ) {
    super()
  }

  async process(job: Job<ApiUsersJob>): Promise<void> {
    switch (job.name) {
      case 'visitor-event':
        await this.sendEventsNotification(job)
        break
    }
  }

  async sendEventsNotification(job: Job<EventsNotificationJob>): Promise<void> {
    // get the user to send the email to
    //
  }
}
