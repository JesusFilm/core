import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { Host, Journey } from '.prisma/api-journeys-client'

@Injectable()
export class TextResponseService {
  constructor(
    @InjectQueue('api-journeys-email') private readonly emailQueue: Queue
  ) {}

  async sendEmail(
    journey: Journey & { host: Host | null },
    response: string
  ): Promise<void> {
    await this.emailQueue.add('textResponse', {
      host: journey.host,
      subject: `Response for Journey: ${journey.title}`,
      body: response
    })
  }
}
