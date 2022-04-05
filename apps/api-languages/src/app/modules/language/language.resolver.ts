import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'
import { TranslationField } from '@core/nest/decorators'
import { Language } from '../../__generated__/graphql'
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
  async language(@Args('id') id: string): Promise<Language> {
    return await this.languageService.get(id)
  }

  @ResolveField()
  @TranslationField('name')
  name(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}
}
