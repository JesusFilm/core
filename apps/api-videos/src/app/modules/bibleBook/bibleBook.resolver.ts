import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { Prisma } from '.prisma/api-videos-client'
import { Translation } from '@core/nest/common/TranslationModule'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('BibleBook')
export class BibleBookResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField('name')
  async name(
    @Parent() bibleBook,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<Translation[]> {
    const where: Prisma.BibleBookNameWhereInput = {
      bibleBookId: bibleBook.id,
      OR: languageId == null && primary == null ? undefined : []
    }
    if (languageId != null) where.OR?.push({ languageId })
    if (primary != null) where.OR?.push({ primary })
    return await this.prismaService.bibleBookName.findMany({
      where,
      orderBy: { primary: 'desc' }
    })
  }
}
