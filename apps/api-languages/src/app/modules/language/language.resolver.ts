import {
  Args,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'

import { Language, Prisma } from '.prisma/api-languages-client'
import { Translation } from '@core/nest/common/TranslationModule'

import { LanguageIdType, LanguagesFilter } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Language')
export class LanguageResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async languages(
    @Args('offset') offset: number,
    @Args('limit') limit: number,
    @Args('where') where?: LanguagesFilter
  ): Promise<Language[]> {
    const filter: Prisma.LanguageWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }
    return await this.prismaService.language.findMany({
      where: filter,
      skip: offset,
      take: limit
    })
  }

  @Query()
  async language(
    @Args('id') id: string,
    @Args('idType') idType = LanguageIdType.databaseId
  ): Promise<Language | null> {
    return idType === LanguageIdType.databaseId
      ? await this.prismaService.language.findUnique({ where: { id } })
      : await this.prismaService.language.findFirst({ where: { bcp47: id } })
  }

  @ResolveField()
  async name(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<Translation[]> {
    const where: Prisma.LanguageNameWhereInput = {
      parentLanguageId: language.id,
      OR: languageId == null && primary == null ? undefined : []
    }
    if (languageId != null) where.OR?.push({ languageId })
    if (primary != null) where.OR?.push({ primary })

    return await this.prismaService.languageName.findMany({
      where,
      orderBy: { primary: 'desc' }
    })
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'Language'
    id: string
  }): Promise<Language | null> {
    return await this.prismaService.language.findUnique({
      where: { id: reference.id }
    })
  }
}
