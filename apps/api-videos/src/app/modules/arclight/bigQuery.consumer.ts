import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { BigQueryService } from './bigQuery.service'

@Processor('api-videos-arclight')
export class BigQueryConsumer extends WorkerHost {
  constructor(private readonly bigQueryService: BigQueryService) {
    super()
  }

  async process(job: Job): Promise<void> {
    try {
      const iterator =
        await this.bigQueryService.getBigQueryDataFromTableIterator(
          'arclight-test-data.arclight_test.test'
        )
      let results: unknown[] = []
      let res = await iterator.next()
      while (!res.done) {
        results = results.concat(res.value)
        // TODO: incremental write to db
        res = await iterator.next()
      }
      // concat last api call
      results = results.concat(res.value)
      // TODO: write to db last call
    } catch (e) {
      throw new Error(e.message)
    }

    console.log(`${job.name} has run`)
  }
}
