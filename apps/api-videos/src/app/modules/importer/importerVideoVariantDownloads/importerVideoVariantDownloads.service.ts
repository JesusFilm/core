import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { z } from 'zod'

import { VideoVariantDownloadQuality } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideoVariantsService } from '../importerVideoVariants/importerVideoVariants.service'

const videoVariantDownloadsSchema = z
  .object({
    quality: z
      .string()
      .transform<VideoVariantDownloadQuality>(
        (value) => VideoVariantDownloadQuality[value]
      ),
    size: z.number(),
    uri: z.string(),
    videoVariantId: z.string()
  })
  .transform((data) => ({
    ...omit(data, 'uri'),
    url: data.uri
  }))

type VideoVariantDownloads = z.infer<typeof videoVariantDownloadsSchema>

@Injectable()
export class ImporterVideoVariantDownloadsService extends ImporterService<VideoVariantDownloads> {
  schema = videoVariantDownloadsSchema

  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideoVariantsService: ImporterVideoVariantsService
  ) {
    super()
  }

  protected async save(
    videoVariantDownloads: VideoVariantDownloads
  ): Promise<void> {
    if (
      !this.importerVideoVariantsService.ids.includes(
        videoVariantDownloads.videoVariantId
      )
    )
      throw new Error(
        `Video variant with id ${videoVariantDownloads.videoVariantId} not found`
      )
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
    const data = videoVariantDownloads.filter(({ videoVariantId }) =>
      this.importerVideoVariantsService.ids.includes(videoVariantId)
    )
    await this.prismaService.videoVariantDownload.createMany({
      data,
      skipDuplicates: true
    })
  }
}
