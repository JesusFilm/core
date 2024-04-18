import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { BigQueryService } from './bigQuery.service'

@Processor('api-videos-arclight')
export class BigQueryConsumer extends WorkerHost {
  constructor(private readonly bigQueryService: BigQueryService) {
    super()
  }

  async process(job: Job): Promise<void> {
    console.log('job start')
    const tablesToFetch = [
      {
        tableName: 'arclight-test-data.arclight_test.test',
        transformAndLoadFunction: async function functionThatConsumesMyIterator(
          tableName: string,
          bigQueryService: BigQueryService
        ) {
          try {
            const iterator =
              await bigQueryService.getBigQueryDataFromTableIterator(tableName)
            let results: unknown[] = []
            let res = await iterator.next()
            while (!res.done) {
              results = results.concat(res.value)
              // TODO: incremental write to db
              res = await iterator.next()
            }
            // concat last api call
            results = results.concat(res.value)
            // TODO: transform
            // TODO: write to db last call
          } catch (e) {
            console.log(e.message)
          }
        }
      }
    ]
    await Promise.all(
      tablesToFetch.map(async ({ tableName, transformAndLoadFunction }) => {
        await transformAndLoadFunction(tableName, this.bigQueryService)
      })
    )
    console.log(`${job.name} has run`)
  }
}
