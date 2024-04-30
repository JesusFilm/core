import { Injectable } from '@nestjs/common'
import { InferType, boolean, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoDescriptionSchema = object({
  value: string().required(),
  videoId: string().required(),
  languageId: string().required(),
  primary: boolean()
})

type VideoDescription = InferType<typeof videoDescriptionSchema>

@Injectable()
export class ImporterVideoDescriptionService extends ImporterService<VideoDescription> {
  schema = videoDescriptionSchema

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(videoDescription: VideoDescription): Promise<void> {
    const record = await this.prismaService.videoDescription.findUnique({
      where: {
        videoId_languageId: {
          videoId: videoDescription.videoId,
          languageId: videoDescription.languageId
        }
      }
    })
    if (record != null)
      await this.prismaService.videoDescription.update({
        where: {
          videoId_languageId: {
            videoId: videoDescription.videoId,
            languageId: videoDescription.languageId
          }
        },
        data: videoDescription
      })
  }
}
