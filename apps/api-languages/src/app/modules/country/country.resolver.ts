import { TranslationField } from '@core/nest/decorators/TranslationField'
import {
  Resolver,
  Query,
  Args,
  ResolveReference,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { Country, Language, Continent } from '.prisma/api-languages-client'

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
          where: { id }
        })
      : await this.prismaService.country.findUnique({
          where: { slug: id }
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
  async continent(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<Continent[]> {
    console.log(country)
    const result = await this.prismaService.continent.findMany({
      where: {
        languageId: languageId ?? undefined,
        primary,
        countries: { some: { id: country.id } },
        value: { not: '' }
      }
    })
    return result ?? []
  }

  @ResolveField()
  async languages(@Parent() country): Promise<Language[]> {
    const result = await this.prismaService.language.findMany({
      where: {
        countries: { some: { id: country.id } }
      }
    })
    return result ?? []
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
