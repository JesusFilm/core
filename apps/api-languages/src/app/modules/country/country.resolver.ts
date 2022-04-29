import { TranslationField } from '@core/nest/decorators'
import {
  Resolver,
  Query,
  Args,
  ResolveReference,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { Country } from '../../__generated__/graphql'
import { CountryService } from './country.service'

@Resolver('Country')
export class CountryResolver {
  constructor(private readonly countryService: CountryService) {}

  @Query()
  async countries(): Promise<Country[]> {
    return await this.countryService.getAll()
  }

  @Query()
  async country(@Args('id') id: string): Promise<Country> {
    return await this.countryService.get(id)
  }

  @ResolveField()
  @TranslationField('name')
  name(
    @Parent() country,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}

  @ResolveField()
  @TranslationField('permalink')
  permalink(
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

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'Country'
    id: string
  }): Promise<Country> {
    return await this.countryService.get(reference.id)
  }
}
