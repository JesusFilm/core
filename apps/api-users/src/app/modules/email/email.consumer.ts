// code commmented out until all SES requirements for bounce, unsubscribe, GDPR met

import { Processor, WorkerHost } from '@nestjs/bullmq'
// import AWS, { SES } from 'aws-sdk'
import { Job } from 'bullmq'

import { PrismaService } from '../../lib/prisma.service'

// AWS.config.update({ region: 'us-east-2' })

export interface EmailJob {
  userId: string
  subject: string
  body: string
}

@Processor('api-users-email')
export class EmailConsumer extends WorkerHost {
  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  async process(job: Job<EmailJob>): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: job.data.userId }
    })
    if (user == null) {
      throw new Error('User not found')
    }
    console.log('message queue job:', Job.name)
    // await await new SES()
    //   .sendEmail({
    //     Source: 'support@nextstep.is',
    //     Destination: { ToAddresses: [user.email] },
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
