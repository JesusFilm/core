import { Injectable } from '@nestjs/common'
import { InferType, mixed, number, object, string } from 'yup'

import { VideoVariantDownloadQuality } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoVariantDownloadsSchema = object({
  quality: mixed<VideoVariantDownloadQuality>()
    .transform((value) => VideoVariantDownloadQuality[value])
    .oneOf(Object.values(VideoVariantDownloadQuality))
    .required(),
  size: number().required(),
  url: string().required(),
  videoVariantId: string().required()
})

type VideoVariantDownloads = InferType<typeof videoVariantDownloadsSchema>

@Injectable()
export class ImporterVideoVariantDownloadsService extends ImporterService<VideoVariantDownloads> {
  schema = videoVariantDownloadsSchema

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(
    videoVariantDownloads: VideoVariantDownloads
  ): Promise<void> {
    await this.prismaService.videoVariantDownload.upsert({
      where: {
        quality_videoVariantId: {
          quality: videoVariantDownloads.quality,
          videoVariantId: videoVariantDownloads.videoVariantId
        }
      },
      update: videoVariantDownloads,
      create: videoVariantDownloads
    })
  }
}
