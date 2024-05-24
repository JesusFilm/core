import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const videoTitleSchema = z.object({
  value: z.string(),
  videoId: z.string(),
  languageId: z.number().transform(String),
  primary: z.number().transform(Boolean)
})

type VideoTitle = z.infer<typeof videoTitleSchema>

@Injectable()
export class ImporterVideoTitleService extends ImporterService<VideoTitle> {
  schema = videoTitleSchema

  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {
    super()
  }

  protected async save(videoTitle: VideoTitle): Promise<void> {
    if (
      !Object.keys(
        this.importerVideosService.usedSlugs as Record<string, string>
      ).includes(videoTitle.videoId)
    )
      throw new Error(`Video with id ${videoTitle.videoId} not found`)
    await this.prismaService.videoTitle.upsert({
      where: {
        videoId_languageId: {
          videoId: videoTitle.videoId,
          languageId: videoTitle.languageId
        }
      },
      update: videoTitle,
      create: videoTitle
    })
  }

  protected async saveMany(videoTitles: VideoTitle[]): Promise<void> {
    await this.prismaService.videoTitle.createMany({
      data: videoTitles.filter(({ videoId }) =>
        Object.keys(
          this.importerVideosService.usedSlugs as Record<string, string>
        )?.includes(videoId)
      ),
      skipDuplicates: true
    })
  }
}
