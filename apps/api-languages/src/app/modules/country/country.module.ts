import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { CountryResolver } from './country.resolver'
import { CountryService } from './country.service'

@Module({
  imports: [DatabaseModule],
  providers: [CountryResolver, CountryService],
  exports: [CountryService]
})
export class CountryModule {}
