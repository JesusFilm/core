import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { addTableToPrisma } from '../../../libs/bigQueryTables/addTableToPrisma'
import { PrismaService } from '../../lib/prisma.service'

import { BigQueryService } from './bigQuery.service'

const TABLES_TO_FETCH = [
  {
    tableName: 'jfp-data-warehouse.src_arclight.core_video_arclight_data'
  }
]

@Processor('api-videos-arclight')
export class BigQueryConsumer extends WorkerHost {
  constructor(
    private readonly bigQueryService: BigQueryService,
    private readonly prismaService: PrismaService
  ) {
    super()
  }

  async process(job: Job): Promise<void> {
    for (const { tableName } of TABLES_TO_FETCH) {
      const iterator = await this.bigQueryService.bigQueryRowIterator(tableName)
      let res = await iterator.next()
      while (!res.done) {
        await addTableToPrisma(res.value, tableName, this.prismaService)
        res = await iterator.next()
      }
    }
    console.log(`${job.name} has run`)
  }
}
