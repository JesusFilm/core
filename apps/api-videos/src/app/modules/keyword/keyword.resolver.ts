import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { Video } from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('Keyword')
export class KeywordResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField('language')
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
