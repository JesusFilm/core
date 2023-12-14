import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bullmq'

@Processor('api-journeys-email')
export class EmailConsumer {
  @Process()
  async textResponse(job: Job): Promise<void> {
    console.log(job.data)
  }
}
