import { Injectable } from '@nestjs/common'
import { InferType, boolean, number, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoStudyQuestions = object({
  value: string().required(),
  videoId: string().required(),
  languageId: string().required(),
  primary: boolean(),
  order: number().required(),
  crowdinId: string().required()
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
    const record = await this.prismaService.videoStudyQuestion.findUnique({
      where: {
        videoId_languageId_order: {
          videoId: videoStudyQuestions.videoId,
          languageId: videoStudyQuestions.languageId,
          order: videoStudyQuestions.order
        }
      }
    })
    if (record != null)
      await this.prismaService.videoStudyQuestion.update({
        where: {
          videoId_languageId_order: {
            videoId: videoStudyQuestions.videoId,
            languageId: videoStudyQuestions.languageId,
            order: videoStudyQuestions.order
          }
        },
        data: videoStudyQuestions
      })
  }
}
