import { Global, Module } from '@nestjs/common'
import { UserJourneyService } from './userJourney.service'
import { UserJourneyResolver } from './userJourney.resolver'
import { DatabaseModule } from '@core/nest/database'
import { JourneyService } from '../journey/journey.service'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [UserJourneyService, UserJourneyResolver, JourneyService],
  exports: [UserJourneyService]
})
export class UserJourneyModule {}
