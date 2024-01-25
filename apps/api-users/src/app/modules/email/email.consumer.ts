// code commmented out until all SES requirements for bounce, unsubscribe, GDPR met

import { Processor, WorkerHost } from '@nestjs/bullmq'
import AWS, { SES } from 'aws-sdk'
import { Job } from 'bullmq'

import { PrismaService } from '../../lib/prisma.service'
import { MailerService } from '@nestjs-modules/mailer'

AWS.config.update({ region: 'us-east-2' })

export interface EmailJob {
  userId: string
  subject: string
  body: string
}

@Processor('api-users-email')
export class EmailConsumer extends WorkerHost {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService
  ) {
    super()
  }

  async process(job: Job<EmailJob>): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { userId: job.data.userId }
    })

    try {
      await this.mailerService.sendMail({
        to: user?.email,
        subject: job.data.subject,
        // text: job.data.text,
        html: job.data.body
      })
    } catch (e) {
      console.log(e)
    }
    if (user == null) {
      throw new Error('User not found')
    }
    console.log('message queue job:', job.name)
    await await new SES()
      .sendEmail({
        Source: 'support@nextstep.is',
        Destination: { ToAddresses: [user.email] },
        Message: {
          Subject: {
            Charset: 'UTF-8',
            Data: job.data.subject
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: job.data.body
            }
          }
        }
      })
      .promise()
  }
}
