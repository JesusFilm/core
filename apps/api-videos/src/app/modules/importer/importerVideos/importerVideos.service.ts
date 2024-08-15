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
  childIds: z
    .string()
    .nullable()
    .transform((value) =>
      value == null ? [] : value.substring(1, value.length - 1).split(',')
    )
    .transform((value) => value.filter((id) => id.length > 0)),
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
        if (video.slug != null) this.usedSlugs[video.id] = video.slug
      }
    }
  }

  private slugify(id: string, title: string): string {
    return slugify(id, title, this.usedSlugs)
  }

  private transform(
    video: Video
  ): Prisma.VideoCreateInput & { id: string; slug: string } {
    return {
      ...video,
      slug: this.slugify(video.id, video.slug),
      noIndex: false
    }
  }

  protected async save(video: Video): Promise<void> {
    const input = this.transform(video)
    this.ids.push(input.id)
    ;(this.usedSlugs as Record<string, string>)[input.id] = input.slug
    await this.prismaService.video.upsert({
      where: { id: video.id },
      update: input,
      create: input
    })
  }

  protected async saveMany(videos: Video[]): Promise<void> {
    const transformedVideos = videos
      .map((input) => this.transform(input))
      .filter(({ id }) => !this.ids.includes(id))
    await this.prismaService.video.createMany({
      data: transformedVideos,
      skipDuplicates: true
    })
    this.ids = [...this.ids, ...transformedVideos.map(({ id }) => id)]
    for (const video of transformedVideos) {
      ;(this.usedSlugs as Record<string, string>)[video.id] = video.slug
    }
  }
}
