import { TranslationField } from '@core/nest/decorators/TranslationField'
import {
  Resolver,
  Query,
  Args,
  ResolveReference,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { Country, IdType } from '../../__generated__/graphql'
import { LanguageRecord, LanguageService } from '../language/language.service'
import { CountryService } from './country.service'

@Resolver('Country')
export class CountryResolver {
  constructor(
    private readonly countryService: CountryService,
    private readonly languageService: LanguageService
  ) {}

  @Query()
  async countries(): Promise<Country[]> {
    return await this.countryService.getAll()
  }

  @Query()
  async country(
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.databaseId
  ): Promise<Country | Error> {
    return idType === IdType.databaseId
      ? await this.countryService.load(id)
      : await this.countryService.getCountryBySlug(id)
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
  ): void {}

  @ResolveField()
  async languages(
    @Parent() country: Country & { languageIds: string[] }
  ): Promise<LanguageRecord[]> {
    return await this.languageService.getByIds(country.languageIds)
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'Country'
    id: string
  }): Promise<Country | Error> {
    return await this.countryService.load(reference.id)
  }
}
