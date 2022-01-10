import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { JourneyService } from '../journey/journey.service'
import { UserJourneyService } from './userJourney.service'
import { UserJourneyResolver } from './userJourney.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [UserJourneyService, UserJourneyResolver, JourneyService],
  exports: [UserJourneyService]
})
export class UserJourneyModule {}
