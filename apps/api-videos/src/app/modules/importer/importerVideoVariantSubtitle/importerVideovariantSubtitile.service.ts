import { Injectable } from '@nestjs/common'
import { InferType, boolean, object, string } from 'yup'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import omit from 'lodash/omit'

const videoVariantSubtitlesSchema = object({
  value: string().required(),
  primary: boolean().required(),
  languageId: string().required(),
  videoVariantId: string().required(),
  format: string().required()
})

type VideoVariantSubtitles = InferType<typeof videoVariantSubtitlesSchema>

@Injectable()
export class ImporterVideoVariantSubtitlesService extends ImporterService<VideoVariantSubtitles> {
  schema = videoVariantSubtitlesSchema

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(
    videoVariantSubtitles: VideoVariantSubtitles
  ): Promise<void> {
    if (videoVariantSubtitles.format === 'VTT') {
      const record = await this.prismaService.videoVariantSubtitle.findUnique({
        where: {
          videoVariantId_languageId: {
            videoVariantId: videoVariantSubtitles.videoVariantId,
            languageId: videoVariantSubtitles.languageId
          }
        }
      })
      if (record != null)
        await this.prismaService.videoVariantSubtitle.update({
          where: {
            videoVariantId_languageId: {
              videoVariantId: videoVariantSubtitles.videoVariantId,
              languageId: videoVariantSubtitles.languageId
            }
          },
          data: omit(videoVariantSubtitles, ['format'])
        })
    }
  }
}
