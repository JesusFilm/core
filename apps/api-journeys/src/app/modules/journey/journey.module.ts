import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { JourneyService } from './journey.service'
import { JourneyResolvers } from './journey.resolvers'
import { BlockService } from '../block/block.service'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { UserJourneyService } from '../userJourney/userJourney.service'

@Module({
  imports: [DatabaseModule],
  providers: [
    JourneyService,
    JourneyResolvers,
    BlockService,
    DateTimeScalar,
    UserJourneyService
  ],
  exports: [JourneyService]
})
export class JourneyModule {}
