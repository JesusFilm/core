import { Injectable } from '@nestjs/common'
import { InferType, boolean, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoTitleSchema = object({
  value: string().required(),
  videoId: string().required(),
  languageId: string().required(),
  primary: boolean().transform((value) => {
    switch (value) {
      case 1:
        return true
      default:
        return false
    }
  })
})

type VideoTitle = InferType<typeof videoTitleSchema>

@Injectable()
export class VideoTitleService extends ImporterService<VideoTitle> {
  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(videoTitle: VideoTitle): Promise<void> {
    const record = await this.prismaService.videoTitle.findUnique({
      where: {
        videoId_languageId: {
          videoId: videoTitle.videoId,
          languageId: videoTitle.languageId
        }
      }
    })
    if (record != null)
      await this.prismaService.videoTitle.update({
        where: {
          videoId_languageId: {
            videoId: videoTitle.videoId,
            languageId: videoTitle.languageId
          }
        },
        data: videoTitle
      })
  }
}
