import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { JourneyService } from '../journey/journey.service'
import { BlockService } from '../block/block.service'
import { ActionResolver } from './action.resolver'
import { NavigateToJourneyActionResolver } from './navigateToJourney/navigateToJourney.resolver'
import { NavigateToBlockActionResolver } from './navigateToBlockAction/navigateToBlockAction.resolver'
import { LinkActionResolver } from './linkAction/linkAction.resolver'
import { NavigateActionResolver } from './navigateAction/navigateAction.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [
    ActionResolver,
    BlockService,
    DateTimeScalar,
    JourneyService,
    LinkActionResolver,
    NavigateActionResolver,
    NavigateToBlockActionResolver,
    NavigateToJourneyActionResolver
  ]
})
export class ActionModule {}
