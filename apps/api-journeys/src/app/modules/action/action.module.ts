import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { JourneyService } from '../journey/journey.service'
import { BlockService } from '../block/block.service'
import { ActionResolver } from './action.resolver'
import { NavigateToJourneyActionResolver } from './navigateToJourney/navigateToJourney.resolver'
import { NavigateToBlockActionResolver } from './navigateToBlockAction/navigateToBlockAction.resolver'
import { LinkToActionResolver } from './linkToAction/linkToAction.resolver'
import { NavigateActionResolver } from './navigateAction/navigateAction.resolver'

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
