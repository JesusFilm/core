import { Resolver, Query } from '@nestjs/graphql'
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
}
