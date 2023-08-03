import { Resolver, ResolveField, Parent, Args } from '@nestjs/graphql'
import compact from 'lodash/compact'
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
  subtitleCount(@Parent() videoVariant): number {
    return compact(videoVariant.subtitle).length
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
    return await this.prismaService.videoVariantSubtitle.findMany({
      where: {
        videoVariantId: videoVariant.id,
        languageId: languageId ?? undefined,
        primary: primary ?? undefined
      }
    })
  }
}
