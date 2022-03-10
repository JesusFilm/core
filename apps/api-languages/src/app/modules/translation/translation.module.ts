import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { LanguageService } from '../language/language.service'
import { TranslationResolver } from './translation.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [LanguageService, TranslationResolver],
  exports: [TranslationResolver]
})
export class TranslationModule {}
