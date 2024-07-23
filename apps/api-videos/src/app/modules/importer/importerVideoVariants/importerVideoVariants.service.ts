import { Injectable } from '@nestjs/common'

import { z } from 'zod'

import { Prisma } from '.prisma/api-videos-client'

import { convertToSlug } from '../../../../libs/slugify/slugify'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

const videoVariantsSchema = z.object({
  id: z.string(),
  hls: z.string().nullable(),
  duration: z
    .custom()
    .transform(String)
    .transform<number>((value: string) => Math.round(Number(value))),
  languageId: z.number().transform(String),
  videoId: z.string(),
  slug: z.string(),
  languageName: z.string(),
  edition: z
    .string()
    .nullable()
    .transform((value) => value ?? 'base')
})

type VideoVariants = z.infer<typeof videoVariantsSchema>

@Injectable()
export class ImporterVideoVariantsService extends ImporterService<VideoVariants> {
  schema = videoVariantsSchema
  ids: string[] = []
  constructor(
    private readonly prismaService: PrismaService,
    private readonly importerVideosService: ImporterVideosService
  ) {
    super()
  }

  async getExistingIds(): Promise<void> {
    if (this.ids.length === 0) {
      const results = await this.prismaService.videoVariant.findMany({
        select: { id: true }
      })
      this.ids = results.map(({ id }) => id)
    }
  }

  private transform(
    videoVariant: VideoVariants
  ): Prisma.VideoVariantUncheckedCreateInput | null {
    if (this.importerVideosService.usedSlugs?.[videoVariant.videoId] == null)
      return null
    // throw new Error(
    //   `video for variant id: ${
    //     videoVariant.id
    //   } - does not exist! \n${JSON.stringify(videoVariant, null, 2)}`
    // )

    const transformedLanguageName = convertToSlug(videoVariant.languageName)
    const slug = `${
      this.importerVideosService.usedSlugs[videoVariant.videoId]
    }/${transformedLanguageName}`
    return {
      id: videoVariant.id,
      hls: videoVariant.hls,
      duration: videoVariant.duration,
      languageId: videoVariant.languageId,
      videoId: videoVariant.videoId,
      slug
    }
  }

  protected async save(videoVariant: VideoVariants): Promise<void> {
    const transformedVideoVariant = this.transform(videoVariant)
    if (transformedVideoVariant == null) return
    this.ids.push(videoVariant.id)
    await this.prismaService.videoVariant.upsert({
      where: {
        id: videoVariant.id
      },
      update: transformedVideoVariant,
      create: transformedVideoVariant
    })
  }

  protected async saveMany(videoVariants: VideoVariants[]): Promise<void> {
    const transformedVideoVariants = videoVariants
      .map((videoVariant) => this.transform(videoVariant))
      .filter((x) => x !== null)
    await this.prismaService.videoVariant.createMany({
      data: transformedVideoVariants as Prisma.VideoVariantCreateManyInput[],
      skipDuplicates: true
    })
    this.ids = [...this.ids, ...videoVariants.map(({ id }) => id)]
  }
}
