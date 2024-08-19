import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const videoDescriptionSchema = z.object({
  value: z.string(),
  videoId: z.string(),
  languageId: z.number().transform(String),
  primary: z.number().transform(Boolean)
})

type VideoDescription = z.infer<typeof videoDescriptionSchema>

@Injectable()
export class ImporterVideoDescriptionService extends ImporterService<VideoDescription> {
  schema = videoDescriptionSchema

  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {
    super()
  }

  protected async save(videoDescription: VideoDescription): Promise<void> {
    if (!this.importerVideosService.ids.includes(videoDescription.videoId))
      throw new Error(`Video with id ${videoDescription.videoId} not found`)

    await this.prismaService.videoDescription.upsert({
      where: {
        videoId_languageId: {
          videoId: videoDescription.videoId,
          languageId: videoDescription.languageId
        }
      },
      update: videoDescription,
      create: videoDescription
    })
  }

  protected async saveMany(
    videoDescriptions: VideoDescription[]
  ): Promise<void> {
    await this.prismaService.videoDescription.createMany({
      data: videoDescriptions.filter(({ videoId }) =>
        this.importerVideosService.ids.includes(videoId)
      ),
      skipDuplicates: true
    })
  }
}
