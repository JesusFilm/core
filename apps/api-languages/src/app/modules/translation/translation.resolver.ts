import { Resolver, ResolveField, Parent } from '@nestjs/graphql'
import { Language } from '../../__generated__/graphql'
import { LanguageService } from '../language/language.service'

@Resolver('Translation')
export class TranslationResolver {
  constructor(private readonly languageService: LanguageService) {}

  @ResolveField()
  async language(@Parent() translation): Promise<Language> {
    return await this.languageService.get(translation.languageId)
  }
}
