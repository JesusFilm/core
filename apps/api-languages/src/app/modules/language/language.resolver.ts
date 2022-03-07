import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'
import { KeyAsId } from '@core/nest/decorators'
import { Language } from '../../__generated__/graphql'
import { LanguageService } from './language.service'

@Resolver('Language')
export class LanguageResolver {
  constructor(private readonly languageService: LanguageService) {}

  @Query()
  @KeyAsId()
  async languages(): Promise<Language[]> {
    return await this.languageService.getAll()
  }

  @Query()
  @KeyAsId()
  async language(@Args('id') _key: string): Promise<Language> {
    return await this.languageService.get(_key)
  }

  @ResolveField()
  name(
    @Parent() language,
    @Args('languageId') languageId: string
  ): Array<{ value: string; languageId: string; primary: boolean }> {
    if (languageId == null) return language.name

    return language.name.filter(
      (translation) => translation.languageId === languageId
    )
  }
}
