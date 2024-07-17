import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { Prisma } from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('VideoVariant')
export class VideoVariantResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField('language')
  async language(
    @Parent() videoVariant
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'Language', id: videoVariant.languageId }
  }

  @ResolveField('subtitleCount')
  async subtitleCount(@Parent() videoVariant): Promise<number> {
    return (
      (await this.prismaService.videoSubtitle.count({
        where: { videoId: videoVariant.videoId, edition: videoVariant.edition }
      })) ?? 0
    )
  }

  @ResolveField('downloads')
  async downloads(@Parent() videoVariant): Promise<unknown[]> {
    return await this.prismaService.videoVariantDownload.findMany({
      where: { videoVariantId: videoVariant.id }
    })
  }

  @ResolveField('subtitle')
  async subtitle(
    @Parent() videoVariant,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<unknown[]> {
    const where: Prisma.VideoSubtitleWhereInput = {
      videoId: videoVariant.videoId,
      edition: videoVariant.edition
    }
    if (languageId != null || primary != null) {
      where.OR = [
        {
          languageId: languageId ?? undefined
        },
        {
          primary: primary ?? undefined
        }
      ]
    }
    return await this.prismaService.videoSubtitle.findMany({
      where
    })
  }
}
