import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { coreVideoArclightData } from '../../../libs/bigQueryTables/coreVideoArclightData/coreVideoArclightData'
import { coreVideoTitleArclightData } from '../../../libs/bigQueryTables/coreVideoTitleArclightData/coreVideoTitleArclightData'
import { PrismaService } from '../../lib/prisma.service'

import { BigQueryService } from './bigQuery.service'

const TABLES_TO_FETCH = [
  {
    tableName: 'jfp-data-warehouse.src_arclight.core_videoTitle_arclight_data',
    transformAndLoadFunction: coreVideoTitleArclightData
  },
  {
    tableName: 'jfp-data-warehouse.src_arclight.core_video_arclight_data',
    transformAndLoadFunction: coreVideoArclightData
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
    for (const { tableName, transformAndLoadFunction } of TABLES_TO_FETCH) {
      const iterator = await this.bigQueryService.bigQueryRowIterator(tableName)
      let res = await iterator.next()
      while (!res.done) {
        await transformAndLoadFunction(res.value, this.prismaService)
        res = await iterator.next()
      }
    }
    console.log(`${job.name} has run`)
  }
}
