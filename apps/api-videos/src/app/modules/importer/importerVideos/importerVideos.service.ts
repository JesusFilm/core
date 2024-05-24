import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { Prisma, VideoLabel } from '.prisma/api-videos-client'

import { slugify } from '../../../../libs/slugify'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoSchema = z.object({
  id: z.string(),
  label: z.string().transform<VideoLabel>((value) => {
    switch (value) {
      case 'short':
        return VideoLabel.shortFilm
      case 'feature':
        return VideoLabel.featureFilm
      case 'behind_the_scenes':
        return VideoLabel.behindTheScenes
      case 'segments':
        return VideoLabel.segment
      default:
        return value as VideoLabel
    }
  }),
  primaryLanguageId: z.number().transform(String),
  slug: z.string(),
  childIds: z.string().nullable(),
  image: z.string().nullable()
})

type Video = z.infer<typeof videoSchema>

@Injectable()
export class ImporterVideosService extends ImporterService<Video> {
  schema = videoSchema
  usedSlugs: Record<string, string> | undefined
  ids: string[] = []

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  async getUsedSlugs(): Promise<void> {
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
  }

  private slugify(id: string, title: string): string {
    return slugify(id, title, this.usedSlugs)
  }

  private transform(video: Video): Prisma.VideoCreateInput {
    const childIds =
      video.childIds == null
        ? []
        : video.childIds.substring(1, video.childIds.length - 1).split(',')
    return {
      ...video,
      childIds,
      slug: this.slugify(video.id, video.slug),
      noIndex: false
    }
  }

  protected async save(video: Video): Promise<void> {
    const input = this.transform(video)
    await this.prismaService.video.upsert({
      where: { id: video.id },
      update: input,
      create: input
    })
  }

  protected async saveMany(videos: Video[]): Promise<void> {
    await this.prismaService.video.createMany({
      data: videos.map((input) => this.transform(input)),
      skipDuplicates: true
    })
  }
}
