import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { z } from 'zod'

import { Prisma } from '.prisma/api-videos-client'

import { convertToSlug } from '../../../../libs/slugify/slugify'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoVariantsSchema = z.object({
  id: z.string(),
  hls: z.string().nullable(),
  duration: z.number(),
  languageId: z.string(),
  videoId: z.string(),
  slug: z.string(),
  languageName: z.string()
})

type VideoVariants = z.infer<typeof videoVariantsSchema>

@Injectable()
export class ImporterVideoVariantsService extends ImporterService<VideoVariants> {
  schema = videoVariantsSchema
  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  private async transform(
    videoVariant: VideoVariants
  ): Promise<Prisma.VideoVariantCreateInput> {
    const video = await this.prismaService.video.findUnique({
      where: { id: videoVariant.videoId }
    })
    if (video == null)
      throw new Error(
        `video for variant id: ${
          videoVariant.id
        } - does not exist! \n${JSON.stringify(videoVariant, null, 2)}`
      )

    const transformedLanguageName = convertToSlug(videoVariant.languageName)
    const slug = `${video.slug}/${transformedLanguageName}`
    const transformedVideoVariant = {
      ...videoVariant,
      slug,
      duration: Math.round(videoVariant.duration)
    }
    return omit(transformedVideoVariant, ['languageName'])
  }

  protected async save(videoVariant: VideoVariants): Promise<void> {
    const transformedVideoVariant = await this.transform(videoVariant)
    await this.prismaService.videoVariant.upsert({
      where: {
        id: videoVariant.id
      },
      update: transformedVideoVariant,
      create: transformedVideoVariant
    })
  }

  protected async saveMany(videoVariants: VideoVariants[]): Promise<void> {
    const transformedVideoVariants = await Promise.all(
      videoVariants.map(
        async (videoVariant) => await this.transform(videoVariant)
      )
    )
    await this.prismaService.videoVariant.createMany({
      data: transformedVideoVariants,
      skipDuplicates: true
    })
  }
}
