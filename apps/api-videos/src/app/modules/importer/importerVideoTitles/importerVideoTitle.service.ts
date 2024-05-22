import { Injectable } from '@nestjs/common'
import { InferType, boolean, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoTitleSchema = object({
  value: string().required(),
  videoId: string().required(),
  languageId: string().required(),
  primary: boolean().required()
})

type VideoTitle = InferType<typeof videoTitleSchema>

@Injectable()
export class ImporterVideoTitleService extends ImporterService<VideoTitle> {
  schema = videoTitleSchema

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(videoTitle: VideoTitle): Promise<void> {
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
      data: videoTitles,
      skipDuplicates: true
    })
  }
}
