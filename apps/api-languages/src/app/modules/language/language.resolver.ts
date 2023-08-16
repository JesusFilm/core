import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject } from '@nestjs/common'
import { Cache } from 'cache-manager'

import {
  Args,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'

import { Language } from '.prisma/api-languages-client'
import { TranslationField } from '@core/nest/decorators/TranslationField'

import { LanguageIdType } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

const ONE_DAY_MS = 86400000

@Resolver('Language')
export class LanguageResolver {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  async languages(
    @Args('offset') offset: number,
    @Args('limit') limit: number
  ): Promise<Language[]> {
    const key = `languages-${offset}-${limit}`
    const cache = await this.cacheManager.get<Language[]>(key)
    if (cache != null) return cache

    const result = await this.prismaService.language.findMany({
      skip: offset,
      take: limit
    })

    await this.cacheManager.set(key, result, ONE_DAY_MS)

    return result
  }

  @Query()
  async language(
    @Args('id') id: string,
    @Args('idType') idType = LanguageIdType.databaseId
  ): Promise<Language | null> {
    if (idType === LanguageIdType.databaseId) {
      const key = `language-id-${id}`
      const cache = await this.cacheManager.get<Language>(key)
      if (cache != null) return cache

      const result = await this.prismaService.language.findUnique({
        where: { id }
      })

      if (result != null) await this.cacheManager.set(key, result, ONE_DAY_MS)

      return result
    }
    const key = `language-bcp47-${id}`
    const cache = await this.cacheManager.get<Language>(key)
    if (cache != null) return cache

    const result = await this.prismaService.language.findFirst({
      where: { bcp47: id }
    })

    if (result != null) await this.cacheManager.set(key, result, ONE_DAY_MS)

    return result
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
    const key = `language-id-${reference.id}`
    const cache = await this.cacheManager.get<Language>(key)
    if (cache != null) return cache

    const result = await this.prismaService.language.findUnique({
      where: { id: reference.id }
    })

    if (result != null) await this.cacheManager.set(key, result, ONE_DAY_MS)
    return result
  }
}
