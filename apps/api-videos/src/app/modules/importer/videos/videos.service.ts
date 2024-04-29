import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { InferType, mixed, object, string } from 'yup'

import { Prisma, VideoLabel } from '.prisma/api-videos-client'

import { slugify } from '../../../../libs/slugify'
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
  primaryLanguageId: string().required(),
  title: string().required()
})

type Video = InferType<typeof videoSchema>

@Injectable()
export class VideosService extends ImporterService<Video> {
  schema = videoSchema
  usedSlugs: Record<string, string> | undefined
  ids: string[] = []

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  private async transform(video: Video): Promise<Prisma.VideoCreateInput> {
    if (this.usedSlugs == null) {
      const results = await this.prismaService.video.findMany({
        select: { slug: true, id: true }
      })
      this.usedSlugs = {}
      for await (const video of results) {
        this.ids.push(video.id)
        if (video.slug != null) this.usedSlugs[video.slug] = video.id
      }
    }

    const slug = slugify(video.id, video.title, this.usedSlugs)

    return {
      ...omit(video, ['title']),
      slug
    }
  }

  protected async save(video: Video): Promise<void> {
    const record = await this.prismaService.video.findUnique({
      where: { id: video.id }
    })
    if (record != null) {
      const videoObj = await this.transform(video)
      await this.prismaService.video.update({
        where: { id: videoObj.id },
        data: videoObj
      })
    }
  }
}
