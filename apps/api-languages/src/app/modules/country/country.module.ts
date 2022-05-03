import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { LanguageService } from '../language/language.service'
import { CountryResolver } from './country.resolver'
import { CountryService } from './country.service'

@Module({
  imports: [DatabaseModule],
  providers: [CountryResolver, CountryService, LanguageService],
  exports: [CountryService]
})
export class CountryModule {}
