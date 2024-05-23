import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { Prisma, VideoLabel } from '.prisma/api-videos-client'

import { slugify } from '../../../../libs/slugify'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoSchema = z.object({
  id: z.string(),
  label: z.custom().transform<VideoLabel>((value) => {
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

  private async transform(video: Video): Promise<Prisma.VideoCreateInput> {
    if (video.childIds == null) {
      return {
        ...video,
        childIds: [],
        slug: await this.slugify(video.id, video.slug),
        noIndex: false
      }
    }
    const string = video.childIds
    const stringArray = string.substring(1, string.length - 1).split(',')
    return {
      ...video,
      childIds: stringArray,
      slug: await this.slugify(video.id, video.slug),
      noIndex: false
    }
  }

  protected async save(video: Video): Promise<void> {
    const input = await this.transform(video)
    await this.prismaService.video.upsert({
      where: { id: video.id },
      update: input,
      create: input
    })
  }

  protected async saveMany(videos: Video[]): Promise<void> {
    const inputs: Prisma.VideoCreateInput[] = []
    for (const video of videos) {
      inputs.push(await this.transform(video))
    }
    // console.log(inputs)
    await this.prismaService.video.createMany({
      data: inputs,
      skipDuplicates: true
    })
  }
}
