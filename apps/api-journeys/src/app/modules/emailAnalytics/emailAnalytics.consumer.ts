import { Processor, WorkerHost } from '@nestjs/bullmq'

import { EmailService } from '@core/nest/common/email/emailService'

import { PrismaService } from '../../lib/prisma.service'

// create the type for the job data

@Processor('api-journeys-email-analytics')
export class EmailAnalyticsConsumer extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService
  ) {
    super()
  }

  async process(job): Promise<void> {
    switch (job.name) {
      case 'email-analytics':
        await this.sendAnalyticsNotification(job)
        break
    }
  }

  async sendAnalyticsNotification(job): Promise<void> {
    // get the user to send the email to
    //
  }
}
