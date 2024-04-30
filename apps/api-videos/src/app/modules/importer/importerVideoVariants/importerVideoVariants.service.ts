import { Injectable } from '@nestjs/common'
import { InferType, number, object, string } from 'yup'

import { Prisma } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoVariantsSchema = object({
  id: string().required(),
  hls: string().nullable(),
  duration: number().required(),
  languageId: string().required(),
  videoId: string().required()
})

type VideoVariants = InferType<typeof videoVariantsSchema>

@Injectable()
export class ImporterVideoVariantsService extends ImporterService<VideoVariants> {
  schema = videoVariantsSchema

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  private async transform(
    videoVariant
  ): Promise<Prisma.VideoVariantCreateInput> {
    const transformedVideoVariant = {
      ...videoVariant,
      duration: Math.round(videoVariant.duration)
    }
    return transformedVideoVariant
  }

  protected async save(videoVariant: VideoVariants): Promise<void> {
    const transformedVideoVariant = await this.transform(videoVariant)
    const record = await this.prismaService.videoVariant.findUnique({
      where: {
        id: transformedVideoVariant.id
      }
    })
    if (record != null)
      await this.prismaService.videoVariant.update({
        where: {
          id: transformedVideoVariant.id
        },
        data: transformedVideoVariant
      })
  }
}
