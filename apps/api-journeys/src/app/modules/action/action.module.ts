import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { JourneyService } from '../journey/journey.service'
import { ActionResolver } from './action.resolvers'
import { NavigateToJourneyActionResolver } from './navigateToJournney/navigateToJourney.resolvers'

@Module({
  imports: [DatabaseModule],
  providers: [ActionResolver, JourneyService, NavigateToJourneyActionResolver, DateTimeScalar]
})
export class ActionModule { }
