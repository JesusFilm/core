import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoImageAltSchema = z.object({
  value: z.string(),
  languageId: z.string(),
  primary: z.boolean(),
  videoId: z.string()
})

type VideoImageAlt = z.infer<typeof videoImageAltSchema>

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

  protected async saveMany(videoImageAlts: VideoImageAlt[]): Promise<void> {
    await this.prismaService.videoImageAlt.createMany({
      data: videoImageAlts,
      skipDuplicates: true
    })
  }
}
