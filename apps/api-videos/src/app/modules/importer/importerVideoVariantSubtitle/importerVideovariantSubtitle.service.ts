import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideoVariantsService } from '../importerVideoVariants/importerVideoVariants.service'

const videoVariantSubtitlesSchema = z.object({
  value: z.string(),
  primary: z.number().transform(Boolean),
  languageId: z.number().transform(String),
  videoVariantId: z.string()
})

type VideoVariantSubtitles = z.infer<typeof videoVariantSubtitlesSchema>

@Injectable()
export class ImporterVideoVariantSubtitlesService extends ImporterService<VideoVariantSubtitles> {
  schema = videoVariantSubtitlesSchema

  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideoVariantsService: ImporterVideoVariantsService
  ) {
    super()
  }

  protected async save(
    videoVariantSubtitles: VideoVariantSubtitles
  ): Promise<void> {
    if (
      !this.importerVideoVariantsService.ids.includes(
        videoVariantSubtitles.videoVariantId
      )
    )
      throw new Error(
        `Video variant with id ${videoVariantSubtitles.videoVariantId} not found`
      )

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
      data: videoVariantSubtitles.filter(({ videoVariantId }) =>
        this.importerVideoVariantsService.ids.includes(videoVariantId)
      ),
      skipDuplicates: true
    })
  }
}
