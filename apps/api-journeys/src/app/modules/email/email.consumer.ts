import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

export interface EmailJob {
  email: string
  subject: string
  body: string
}
@Processor('api-journeys-email')
export class EmailConsumer extends WorkerHost {
  async process(job: Job<EmailJob>): Promise<void> {
    console.log(job.data)
  }
}
