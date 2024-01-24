// code commmented out until all SES requirements for bounce, unsubscribe, GDPR met

import { Processor, WorkerHost } from '@nestjs/bullmq'
import { MailerService } from '@nestjs-modules/mailer'
import AWS, { SES } from 'aws-sdk'
import { Job } from 'bullmq'

AWS.config.update({ region: 'us-east-2' })

export interface EmailJob {
  email: string
  subject: string
  body: string
  text: string
}
@Processor('api-journeys-email')
export class EmailConsumer extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super()
  }

  async process(job: Job<EmailJob>): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: job.data.email,
        subject: job.data.subject,
        text: job.data.text,
        html: job.data.body
      })
    } catch (e) {
      console.log(e)
    }
    await new SES({ region: 'us-east-2' })
      .sendEmail({
        Source: 'support@nextstep.is',
        Destination: { ToAddresses: [job.data.email] },
        Message: {
          Subject: {
            Charset: 'UTF-8',
            Data: job.data.subject
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: job.data.body
            },
            Text: {
              Charset: 'UTF-8',
              Data: job.data.text
            }
          }
        }
      })
      .promise()
  }
}
