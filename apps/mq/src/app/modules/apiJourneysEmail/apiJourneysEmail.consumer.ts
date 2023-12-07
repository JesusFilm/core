import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bullmq'

@Processor('api-journeys-email')
export class ApiJourneysEmailConsumer {
  @Process()
  async textResponse(job: Job) {
    console.log(job.data)
  }
}
