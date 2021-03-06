import {
  Resolver,
  Query,
  Args,
  ResolveField,
  ResolveReference,
  Parent
} from '@nestjs/graphql'
import { TranslationField } from '@core/nest/decorators/TranslationField'
import { Language, LanguageIdType } from '../../__generated__/graphql'
import { LanguageService } from './language.service'

@Resolver('Language')
export class LanguageResolver {
  constructor(private readonly languageService: LanguageService) {}

  @Query()
  async languages(
    @Args('offset') offset: number,
    @Args('limit') limit: number
  ): Promise<Language[]> {
    return await this.languageService.getAll(offset, limit)
  }

  @Query()
  async language(
    @Args('id') id: string,
    @Args('idType') idType = LanguageIdType.databaseId
  ): Promise<Language> {
    return idType === LanguageIdType.databaseId
      ? await this.languageService.get(id)
      : await this.languageService.getByBcp47(id)
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
  }): Promise<Language> {
    return await this.languageService.get(reference.id)
  }
}
