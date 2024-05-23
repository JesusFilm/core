import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoSnippetSchema = z.object({
  value: z.string(),
  languageId: z.string(),
  primary: z.boolean(),
  videoId: z.string()
})

type VideoSnippet = z.infer<typeof videoSnippetSchema>

@Injectable()
export class ImporterVideoSnippetsService extends ImporterService<VideoSnippet> {
  schema = videoSnippetSchema
  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(videoSnippet: VideoSnippet): Promise<void> {
    await this.prismaService.videoSnippet.upsert({
      where: {
        videoId_languageId: {
          videoId: videoSnippet.videoId,
          languageId: videoSnippet.languageId
        }
      },
      update: videoSnippet,
      create: videoSnippet
    })
  }

  protected async saveMany(videoSnippets: VideoSnippet[]): Promise<void> {
    await this.prismaService.videoSnippet.createMany({
      data: videoSnippets,
      skipDuplicates: true
    })
  }
}
