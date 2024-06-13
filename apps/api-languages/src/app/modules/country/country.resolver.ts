import {
  Args,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'

import { Country, Language, Prisma } from '.prisma/api-languages-client'
import { Translation } from '@core/nest/common/TranslationModule'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('Country')
export class CountryResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async countries(): Promise<Country[]> {
    return await this.prismaService.country.findMany()
  }

  @Query()
  async country(@Args('id') id: string): Promise<Country | null> {
    return await this.prismaService.country.findUnique({ where: { id } })
  }

  @ResolveField()
  async name(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<Translation[]> {
    const where: Prisma.CountryNameWhereInput = {
      countryId: country.id,
      OR: languageId == null && primary == null ? undefined : []
    }
    if (languageId != null) where.OR?.push({ languageId })
    if (primary != null) where.OR?.push({ primary })

    return (await this.prismaService.countryName.findMany({
      where,
      orderBy: { primary: 'desc' }
    })) as Translation[]
  }

  @ResolveField()
  async continent(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): Promise<Translation[]> {
    const where: Prisma.CountryContinentWhereInput = {
      countryId: country.id,
      OR: languageId == null && primary == null ? undefined : []
    }
    if (languageId != null) where.OR?.push({ languageId })
    if (primary != null) where.OR?.push({ primary })

    return (await this.prismaService.countryContinent.findMany({
      where,
      orderBy: { primary: 'desc' }
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
  }): Promise<Country | null> {
    return await this.prismaService.country.findUnique({
      where: { id: reference.id }
    })
  }
}
