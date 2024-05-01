import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { InferType, boolean, number, object, string } from 'yup'

import { Prisma } from '.prisma/api-videos-client'

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
    const record = await this.prismaService.videoImageAlt.findUnique({
      where: {
        videoId_languageId: {
          videoId: videoImageAlt.videoId,
          languageId: videoImageAlt.languageId
        }
      }
    })
    if (record != null) {
      await this.prismaService.videoImageAlt.update({
        where: {
          videoId_languageId: {
            videoId: videoImageAlt.videoId,
            languageId: videoImageAlt.languageId
          }
        },
        data: videoImageAlt
      })
    }
  }
}
