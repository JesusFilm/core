import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { LanguageResolver } from './language.resolver'
import { LanguageService } from './language.service'

@Module({
  imports: [DatabaseModule],
  providers: [LanguageResolver, LanguageService],
  exports: [LanguageService]
})
export class LanguageModule {}
