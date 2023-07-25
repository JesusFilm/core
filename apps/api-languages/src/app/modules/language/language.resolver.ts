import {
  Resolver,
  Query,
  Args,
  ResolveField,
  ResolveReference,
  Parent
} from '@nestjs/graphql'
import { TranslationField } from '@core/nest/decorators/TranslationField'
import { Language } from '.prisma/api-languages-client'

import { PrismaService } from '../../lib/prisma.service'
import { LanguageIdType } from '../../__generated__/graphql'

@Resolver('Language')
export class LanguageResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async languages(
    @Args('offset') offset: number,
    @Args('limit') limit: number
  ): Promise<Language[]> {
    return await this.prismaService.language.findMany({
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
  @TranslationField('name')
  name(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

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
