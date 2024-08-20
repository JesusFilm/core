import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { z } from 'zod'

import { VideoVariantDownloadQuality } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoVariantDownloadsSchema = z
  .object({
    quality: z.nativeEnum(VideoVariantDownloadQuality),
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
  videoVariantIds: string[] = []

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  // This is used to fix a foreign key constraint error after createMany
  async getExistingVariantIds(): Promise<void> {
    if (this.videoVariantIds.length === 0) {
      const results = await this.prismaService.videoVariant.findMany({
        select: { id: true }
      })
      this.videoVariantIds = results.map(({ id }) => id)
    }
  }

  protected async save(
    videoVariantDownloads: VideoVariantDownloads
  ): Promise<void> {
    await this.getExistingVariantIds()
    if (!this.videoVariantIds.includes(videoVariantDownloads.videoVariantId))
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
    await this.getExistingVariantIds()
    await this.prismaService.videoVariantDownload.createMany({
      data: videoVariantDownloads.filter(({ videoVariantId }) =>
        this.videoVariantIds.includes(videoVariantId)
      ),
      skipDuplicates: true
    })
  }
}
