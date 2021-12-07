import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../lib/database/database.module'
import { JourneyService } from '../journey/journey.service'
import { ActionResolver } from './action.resolvers'
import { NavigateToJourneyActionResolver } from './navigateToJournney/navigateToJourney.resolvers'

@Module({
  imports: [DatabaseModule],
  providers: [ActionResolver, JourneyService, NavigateToJourneyActionResolver]
})
export class ActionModule { }
