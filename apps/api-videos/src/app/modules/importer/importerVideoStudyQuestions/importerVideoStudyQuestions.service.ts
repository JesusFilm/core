import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const videoStudyQuestions = z.object({
  value: z.string(),
  videoId: z.string(),
  languageId: z.number().transform(String),
  primary: z.number().transform(Boolean),
  order: z.number(),
  crowdInId: z.string().optional()
})

type VideoStudyQuestions = z.infer<typeof videoStudyQuestions>

@Injectable()
export class ImporterVideoStudyQuestionsService extends ImporterService<VideoStudyQuestions> {
  schema = videoStudyQuestions

  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {
    super()
  }

  protected async save(
    videoStudyQuestions: VideoStudyQuestions
  ): Promise<void> {
    if (!this.importerVideosService.ids.includes(videoStudyQuestions.videoId))
      throw new Error(`Video with id ${videoStudyQuestions.videoId} not found`)

    await this.prismaService.videoStudyQuestion.upsert({
      where: {
        videoId_languageId_order: {
          videoId: videoStudyQuestions.videoId,
          languageId: videoStudyQuestions.languageId,
          order: videoStudyQuestions.order
        }
      },
      update: videoStudyQuestions,
      create: videoStudyQuestions
    })
  }

  protected async saveMany(
    videoStudyQuestions: VideoStudyQuestions[]
  ): Promise<void> {
    await this.prismaService.videoStudyQuestion.createMany({
      data: videoStudyQuestions.filter(({ videoId }) =>
        this.importerVideosService.ids.includes(videoId)
      ),
      skipDuplicates: true
    })
  }
}
