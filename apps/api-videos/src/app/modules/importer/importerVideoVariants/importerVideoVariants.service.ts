import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { InferType, number, object, string } from 'yup'

import { Prisma } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const videoVariantsSchema = object({
  id: string().required(),
  hls: string().nullable(),
  duration: number().required(),
  languageId: string().required(),
  videoId: string().required(),
  slug: string().required(),
  languageName: string().required()
})

type VideoVariants = InferType<typeof videoVariantsSchema>

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
    const slug = `${video.slug}/${videoVariant.languageName}`
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

    console.log('finished uploading: ', videoVariant.id)
  }
}
