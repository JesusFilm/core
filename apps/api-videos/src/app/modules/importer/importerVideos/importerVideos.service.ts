import { Injectable } from '@nestjs/common'

import { InferType, mixed, object, string } from 'yup'

import { VideoLabel } from '.prisma/api-videos-client'

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
  slug: string().required()
})

type Video = InferType<typeof videoSchema>

@Injectable()
export class ImporterVideosService extends ImporterService<Video> {
  schema = videoSchema
  usedSlugs: Record<string, string> | undefined
  ids: string[] = []

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  private async slugify(id: string, title: string): Promise<string> {
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

    const slug = slugify(id, title, this.usedSlugs)

    return slug
  }

  protected async save(video: Video): Promise<void> {
    const input = { ...video, slug: await this.slugify(video.id, video.slug) }
    await this.prismaService.video.upsert({
      where: { id: video.id },
      update: input,
      create: input
    })
  }
}
