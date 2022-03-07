import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { TranslationResolver } from '../translation/translation.resolver'
import { LanguageResolver } from './language.resolver'
import { LanguageService } from './language.service'

@Module({
  imports: [DatabaseModule],
  providers: [LanguageResolver, LanguageService, TranslationResolver],
  exports: [LanguageService]
})
export class LanguageModule {}
