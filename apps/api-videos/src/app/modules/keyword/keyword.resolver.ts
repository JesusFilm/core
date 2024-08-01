import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { Keyword, Video } from '.prisma/api-videos-client'

@Resolver('Keyword')
export class KeywordResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async keywords(@Args('languageId') languageId?: string): Promise<Keyword[]> {
    return await this.prismaService.keyword.findMany({
      where: { languageId }
    })
  }

  @ResolveField()
  async language(
    @Parent() keyword
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'Language', id: keyword.languageId }
  }

  @ResolveField()
  async videos(@Parent() keyword): Promise<Video[]> {
    return await this.prismaService.video.findMany({
      where: { keywords: { some: { id: keyword.id } } }
    })
  }
}
