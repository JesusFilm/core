import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bullmq'

export interface EmailJob {
  email: string
  subject: string
  body: string
}
@Processor('api-journeys-email')
export class EmailConsumer {
  @Process('email')
  async email(job: Job<EmailJob>): Promise<void> {
    console.log(job)
  }
}
