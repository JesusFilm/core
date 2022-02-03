import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { JourneyService } from '../journey/journey.service'
import { BlockService } from '../block/block.service'
import { ActionResolver } from './action.resolvers'
import { NavigateToJourneyActionResolver } from './navigateToJourney/navigateToJourney.resolvers'
import { NavigateToBlockActionResolver } from './navigateToBlockAction/navigateToBlockAction.resolvers'
import { LinkToActionResolver } from './linkToAction/linkToAction.resolvers'
import { NavigateActionResolver } from './navigateAction/navigateAction.resolvers'

@Module({
  imports: [DatabaseModule],
  providers: [
    ActionResolver,
    BlockService,
    DateTimeScalar,
    JourneyService,
    LinkToActionResolver,
    NavigateActionResolver,
    NavigateToBlockActionResolver,
    NavigateToJourneyActionResolver
  ]
})
export class ActionModule {}
