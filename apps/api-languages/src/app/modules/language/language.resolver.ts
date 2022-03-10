import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'
import { KeyAsId, TranslationField } from '@core/nest/decorators'
import { Language } from '../../__generated__/graphql'
import { LanguageService } from './language.service'

@Resolver('Language')
export class LanguageResolver {
  constructor(private readonly languageService: LanguageService) {}

  @Query()
  @KeyAsId()
  async languages(
    @Args('page') page: number,
    @Args('limit') limit: number
  ): Promise<Language[]> {
    return await this.languageService.getAll(page, limit)
  }

  @Query()
  @KeyAsId()
  async language(@Args('id') _key: string): Promise<Language> {
    return await this.languageService.get(_key)
  }

  @ResolveField()
  @TranslationField('name')
  name(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}
}
