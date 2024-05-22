import { Injectable } from '@nestjs/common'
import { InferType, boolean, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoVariantSubtitlesSchema = object({
  value: string().required(),
  primary: boolean().required(),
  languageId: string().required(),
  videoVariantId: string().required()
})

type VideoVariantSubtitles = InferType<typeof videoVariantSubtitlesSchema>

@Injectable()
export class ImporterVideoVariantSubtitlesService extends ImporterService<VideoVariantSubtitles> {
  schema = videoVariantSubtitlesSchema

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(
    videoVariantSubtitles: VideoVariantSubtitles
  ): Promise<void> {
    await this.prismaService.videoVariantSubtitle.upsert({
      where: {
        videoVariantId_languageId: {
          videoVariantId: videoVariantSubtitles.videoVariantId,
          languageId: videoVariantSubtitles.languageId
        }
      },
      update: videoVariantSubtitles,
      create: videoVariantSubtitles
    })
  }

  protected async saveMany(
    videoVariantSubtitles: VideoVariantSubtitles[]
  ): Promise<void> {
    await this.prismaService.videoVariantSubtitle.createMany({
      data: videoVariantSubtitles,
      skipDuplicates: true
    })
  }
}
