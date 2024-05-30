import {
  Args,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'

import { Country, Language } from '.prisma/api-languages-client'
import { Translation } from '@core/nest/common/TranslationModule'
import { TranslationField } from '@core/nest/decorators'

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
    @Args('idType') idType = IdType.databaseId
  ): Promise<Country> {
    return idType === IdType.databaseId
      ? await this.prismaService.country.findUnique({ where: { id } })
      : await this.prismaService.country.findUnique({ where: { slug: id } })
  }

  @ResolveField()
  async name(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<Translation[]> {
    return (await this.prismaService.countryName.findMany({
      where: { countryId: country.id }
    })) as Translation[]
  }

  @ResolveField()
  async continent(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<Translation[]> {
    return (await this.prismaService.countryContinent.findMany({
      where: { countryId: country.continentId }
    })) as Translation[]
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
  }): Promise<Country> {
    return await this.prismaService.country.findUnique({
      where: { id: reference.id }
    })
  }
}
