// code commmented out until all SES requirements for bounce, unsubscribe, GDPR met

import { Processor, WorkerHost } from '@nestjs/bullmq'
import AWS, { SES } from 'aws-sdk'
import { Job } from 'bullmq'

AWS.config.update({ region: 'us-east-2' })

export interface EmailJob {
  email: string
  subject: string
  body: string
}
@Processor('api-journeys-email')
export class EmailConsumer extends WorkerHost {
  async process(job: Job<EmailJob>): Promise<void> {
    console.log('message queue job:', job.name)
    // await new SES()
    //   .sendEmail({
    //     Source: 'support@nextstep.is',
    //     Destination: { ToAddresses: [job.data.email] },
    //     Message: {
    //       Subject: {
    //         Charset: 'UTF-8',
    //         Data: job.data.subject
    //       },
    //       Body: {
    //         Html: {
    //           Charset: 'UTF-8',
    //           Data: job.data.body
    //         }
    //       }
    //     }
    //   })
    //   .promise()
  }
}
