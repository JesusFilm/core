import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { JourneyService } from '../journey/journey.service'
import { ActionResolver } from './action.resolver'
import { NavigateToJourneyActionResolver } from './navigateToJournney/navigateToJourney.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [
    ActionResolver,
    JourneyService,
    NavigateToJourneyActionResolver,
    DateTimeScalar
  ]
})
export class ActionModule {}
