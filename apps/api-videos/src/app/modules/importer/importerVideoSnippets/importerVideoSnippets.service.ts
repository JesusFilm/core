import { Injectable } from '@nestjs/common'
import { InferType, boolean, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoSnippetSchema = object({
  value: string().required(),
  languageId: string().required(),
  primary: boolean().required(),
  videoId: string().required()
})

type VideoSnippet = InferType<typeof videoSnippetSchema>

@Injectable()
export class ImporterVideoSnippetsService extends ImporterService<VideoSnippet> {
  schema = videoSnippetSchema
  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(videoSnippet: VideoSnippet): Promise<void> {
    const record = await this.prismaService.videoSnippet.findUnique({
      where: {
        videoId_languageId: {
          videoId: videoSnippet.videoId,
          languageId: videoSnippet.languageId
        }
      }
    })
    if (record != null) {
      await this.prismaService.videoSnippet.update({
        where: {
          videoId_languageId: {
            videoId: videoSnippet.videoId,
            languageId: videoSnippet.languageId
          }
        },
        data: videoSnippet
      })
    }
  }
}
