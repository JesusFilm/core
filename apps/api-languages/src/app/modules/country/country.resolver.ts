import { TranslationField } from '@core/nest/decorators/TranslationField'
import {
  Resolver,
  Query,
  Args,
  ResolveReference,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { Country, Language } from '.prisma/api-languages-client'

import { IdType } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Country')
export class CountryResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async countries(): Promise<Country[]> {
    return await this.prismaService.country.findMany()
  }

  @Query()
  async country(
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.databaseId
  ): Promise<Country | null> {
    return idType === IdType.databaseId
      ? await this.prismaService.country.findUnique({
          where: { id },
          include: { continents: true }
        })
      : await this.prismaService.country.findUnique({
          where: { slug: id },
          include: { continents: true }
        })
  }

  @ResolveField()
  @TranslationField('name')
  name(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('slug')
  slug(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('continent')
  continent(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {
    return country.continents
  }

  @ResolveField()
  async languages(
    @Parent() country: Country & { languageIds: string[] }
  ): Promise<Language[]> {
    return await this.prismaService.language.findMany({
      where: { id: { in: country.languageIds } }
    })
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'Country'
    id: string
  }): Promise<Country | null> {
    return await this.prismaService.country.findUnique({
      where: { id: reference.id }
    })
  }
}
