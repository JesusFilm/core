import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const videoSnippetSchema = z.object({
  value: z.string(),
  languageId: z.number().transform(String),
  primary: z.number().transform(Boolean),
  videoId: z.string()
})

type VideoSnippet = z.infer<typeof videoSnippetSchema>

@Injectable()
export class ImporterVideoSnippetsService extends ImporterService<VideoSnippet> {
  schema = videoSnippetSchema
  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {
    super()
  }

  protected async save(videoSnippet: VideoSnippet): Promise<void> {
    if (!this.importerVideosService.ids.includes(videoSnippet.videoId))
      throw new Error(`Video with id ${videoSnippet.videoId} not found`)
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
      data: videoSnippets.filter(({ videoId }) =>
        this.importerVideosService.ids.includes(videoId)
      ),
      skipDuplicates: true
    })
  }
}
