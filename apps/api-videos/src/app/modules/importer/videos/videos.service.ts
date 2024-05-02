import { Injectable } from '@nestjs/common'
import { InferType, mixed, object, string } from 'yup'

import { VideoLabel } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoSchema = object({
  id: string().required(),
  label: mixed<VideoLabel>()
    .transform((value) => {
      switch (value) {
        case 'short':
          return VideoLabel.shortFilm
        case 'feature':
          return VideoLabel.featureFilm
        case 'behind_the_scenes':
          return VideoLabel.behindTheScenes
        default:
          return value
      }
    })
    .oneOf(Object.values(VideoLabel))
    .required(),
  primaryLanguageId: string().required()
})

type Video = InferType<typeof videoSchema>

@Injectable()
export class VideosService extends ImporterService<Video> {
  schema = videoSchema

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  protected async save(video: Video): Promise<void> {
    const record = await this.prismaService.video.findUnique({
      where: { id: video.id }
    })
    if (record != null)
      await this.prismaService.video.update({
        where: { id: video.id },
        data: video
      })
  }
}
