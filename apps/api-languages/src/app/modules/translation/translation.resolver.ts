import { Resolver, ResolveField, Parent } from '@nestjs/graphql'
import { LanguageRecord, LanguageService } from '../language/language.service'

@Resolver('Translation')
export class TranslationResolver {
  constructor(private readonly languageService: LanguageService) {}

  @ResolveField()
  async language(@Parent() translation): Promise<LanguageRecord | Error> {
    return await this.languageService.load(translation.languageId)
  }
}
