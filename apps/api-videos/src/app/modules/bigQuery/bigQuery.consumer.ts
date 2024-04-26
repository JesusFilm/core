import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { mixed, number, object, string } from 'yup'

import { VideoLabel } from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

import { BigQueryService } from './bigQuery.service'

const TABLES_TO_FETCH = {
  videos: 'jfp-data-warehouse.src_arclight.core_video_arclight_data'
}

@Processor('api-videos-arclight')
export class BigQueryConsumer extends WorkerHost {
  constructor(
    private readonly bigQueryService: BigQueryService,
    private readonly prismaService: PrismaService
  ) {
    super()
  }

  async process(job: Job): Promise<void> {
    for (const [localTableName, remoteTableName] of Object.entries(
      TABLES_TO_FETCH
    )) {
      for await (const row of this.bigQueryService.getRowsFromTable(
        remoteTableName
      )) {
        await this[localTableName](row)
      }
    }
    console.log(`${job.name} has run`)
  }

  async videos(row: unknown): Promise<void> {
    const videoSchema = object({
      id: string().required(),
      label: mixed<VideoLabel>().oneOf(Object.values(VideoLabel)).required(),
      primaryLanguageId: number().required()
    })
    const video = videoSchema.noUnknown().cast(row)
    if (
      (await this.prismaService.video.findUnique({
        where: { id: video.id }
      })) != null
    ) {
      await this.prismaService.video.update({
        where: { id: video.id },
        data: {
          ...video,
          primaryLanguageId: video.primaryLanguageId.toString()
        }
      })
    }
  }
}
