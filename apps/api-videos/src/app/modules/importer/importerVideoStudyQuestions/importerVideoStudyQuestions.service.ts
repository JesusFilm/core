import { Injectable } from '@nestjs/common'
import { InferType, boolean, number, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoStudyQuestions = object({
  value: string().required(),
  videoId: string().required(),
  languageId: string().required(),
  primary: boolean().required(),
  order: number().required(),
  crowdInId: string().required()
})

type VideoStudyQuestions = InferType<typeof videoStudyQuestions>

@Injectable()
export class ImporterVideoStudyQuestionsService extends ImporterService<VideoStudyQuestions> {
  schema = videoStudyQuestions

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(
    videoStudyQuestions: VideoStudyQuestions
  ): Promise<void> {
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
      data: videoStudyQuestions,
      skipDuplicates: true
    })
  }
}
