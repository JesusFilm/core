import { Injectable } from '@nestjs/common'
import { InferType, boolean, number, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoImageAltSchema = object({
  value: string().required(),
  languageId: string().required(),
  primary: boolean().required(),
  videoId: string().required()
})

type VideoImageAlt = InferType<typeof videoImageAltSchema>

@Injectable()
export class ImporterVideoImageAltService extends ImporterService<VideoImageAlt> {
  schema = videoImageAltSchema
  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(videoImageAlt: VideoImageAlt): Promise<void> {
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
}
