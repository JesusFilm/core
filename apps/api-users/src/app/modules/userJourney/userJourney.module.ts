import { Module } from '@nestjs/common'
import { UserJourneyService } from './userJourney.service'
import { UserJourneyResolver } from './userJourney.resolver'
import { DatabaseModule } from '@core/nest/database'

@Module({
  imports: [DatabaseModule],
  providers: [UserJourneyService, UserJourneyResolver],
  exports: [UserJourneyService]
})
export class UserJourneyModule {}
