import { TranslationField } from '@core/nest/decorators'
import {
  Resolver,
  Query,
  Args,
  ResolveReference,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { Country, IdType, Language } from '../../__generated__/graphql'
import { LanguageService } from '../language/language.service'
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
  ): Promise<Country> {
    return idType === IdType.databaseId
      ? await this.countryService.get(id)
      : await this.countryService.getCountryBySlug(id)
  }

  @ResolveField()
  @TranslationField('name')
  name(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean,
    @Args('fallback') fallback?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('slug')
  slug(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean,
    @Args('fallback') fallback?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('continent')
  continent(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean,
    @Args('fallback') fallback?: boolean
  ): void {}

  @ResolveField()
  async languages(
    @Parent() country: Country & { languageIds: string[] }
  ): Promise<Language[]> {
    return await this.languageService.getByIds(country.languageIds)
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'Country'
    id: string
  }): Promise<Country> {
    return await this.countryService.get(reference.id)
  }
}
