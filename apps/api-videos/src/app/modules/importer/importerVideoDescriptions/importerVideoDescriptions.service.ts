import { Injectable } from '@nestjs/common'
import { InferType, boolean, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoDescriptionSchema = object({
  value: string().required(),
  videoId: string().required(),
  languageId: string().required(),
  primary: boolean().required()
})

type VideoDescription = InferType<typeof videoDescriptionSchema>

@Injectable()
export class ImporterVideoDescriptionService extends ImporterService<VideoDescription> {
  schema = videoDescriptionSchema

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(videoDescription: VideoDescription): Promise<void> {
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
      data: videoDescriptions,
      skipDuplicates: true
    })
  }
}
