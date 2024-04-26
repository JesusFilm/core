import { Injectable } from '@nestjs/common'
import get from 'lodash/get'
import { mixed, object, string } from 'yup'

import { VideoLabel } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

@Injectable()
export class VideosService extends ImporterService {
  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  async import(row: unknown): Promise<void> {
    const videoSchema = object({
      id: string().required(),
      label: mixed<VideoLabel>()
        .transform((value) => {
          switch (value) {
            case 'short':
              return VideoLabel.shortFilm
            case 'feature':
              return VideoLabel.featureFilm
            default:
              return value
          }
        })
        .oneOf(Object.values(VideoLabel))
        .required(),
      primaryLanguageId: string().required()
    })
    if (await videoSchema.isValid(row)) {
      const video = videoSchema.noUnknown().cast(row)
      if (
        (await this.prismaService.video.findUnique({
          where: { id: video.id }
        })) != null
      )
        await this.prismaService.video.update({
          where: { id: video.id },
          data: video
        })
    } else {
      throw new Error(
        `row does not match schema: ${
          get(row, 'id') ?? 'unknownId'
        }\n${JSON.stringify(row, null, 2)}`
      )
    }
  }
}
