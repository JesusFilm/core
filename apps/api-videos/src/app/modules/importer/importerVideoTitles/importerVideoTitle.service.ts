import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoTitleSchema = z.object({
  value: z.string(),
  videoId: z.string(),
  languageId: z.number().transform(String),
  primary: z.boolean()
})

type VideoTitle = z.infer<typeof videoTitleSchema>

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
