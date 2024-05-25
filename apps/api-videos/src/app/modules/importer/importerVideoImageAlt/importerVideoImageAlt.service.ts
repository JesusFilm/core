import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const videoImageAltSchema = z.object({
  value: z.string(),
  languageId: z.number().transform(String),
  primary: z.number().transform(Boolean),
  videoId: z.string()
})

type VideoImageAlt = z.infer<typeof videoImageAltSchema>

@Injectable()
export class ImporterVideoImageAltService extends ImporterService<VideoImageAlt> {
  schema = videoImageAltSchema
  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {
    super()
  }

  protected async save(videoImageAlt: VideoImageAlt): Promise<void> {
    if (!this.importerVideosService.ids.includes(videoImageAlt.videoId))
      throw new Error(`Video with id ${videoImageAlt.videoId} not found`)
    await this.prismaService.videoImageAlt.upsert({
      where: {
        videoId_languageId: {
          videoId: videoImageAlt.videoId,
          languageId: videoImageAlt.languageId
        }
      },
      update: videoImageAlt,
      create: videoImageAlt
    })
  }

  protected async saveMany(videoImageAlts: VideoImageAlt[]): Promise<void> {
    await this.prismaService.videoImageAlt.createMany({
      data: videoImageAlts.filter(({ videoId }) =>
        this.importerVideosService.ids.includes(videoId)
      ),
      skipDuplicates: true
    })
  }
}
