import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { VideoVariantDownloadQuality } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoVariantDownloadsSchema = z.object({
  quality: z
    .custom()
    .transform<VideoVariantDownloadQuality>(
      (value: string) => VideoVariantDownloadQuality[value]
    ),
  size: z.number(),
  url: z.string(),
  videoVariantId: z.string()
})

type VideoVariantDownloads = z.infer<typeof videoVariantDownloadsSchema>

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

  protected async saveMany(
    videoVariantDownloads: VideoVariantDownloads[]
  ): Promise<void> {
    await this.prismaService.videoVariantDownload.createMany({
      data: videoVariantDownloads,
      skipDuplicates: true
    })
  }
}
