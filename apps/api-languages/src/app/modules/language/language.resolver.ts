import {
  Resolver,
  Query,
  Args,
  ResolveField,
  ResolveReference,
  Parent
} from '@nestjs/graphql'
import { TranslationField } from '@core/nest/decorators/TranslationField'
import { LanguageIdType } from '../../__generated__/graphql'
import { LanguageRecord, LanguageService } from './language.service'

@Resolver('Language')
export class LanguageResolver {
  constructor(private readonly languageService: LanguageService) {}

  @Query()
  async languages(
    @Args('offset') offset: number,
    @Args('limit') limit: number
  ): Promise<LanguageRecord[]> {
    return await this.languageService.getAll(offset, limit)
  }

  @Query()
  async language(
    @Args('id') id: string,
    @Args('idType') idType = LanguageIdType.databaseId
  ): Promise<LanguageRecord | Error> {
    return idType === LanguageIdType.databaseId
      ? await this.languageService.load(id)
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
  }): Promise<LanguageRecord | Error> {
    return await this.languageService.load(reference.id)
  }
}
