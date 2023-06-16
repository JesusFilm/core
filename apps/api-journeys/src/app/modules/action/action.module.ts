import { Module } from '@nestjs/common'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { JourneyService } from '../journey/journey.service'
import { PrismaService } from '../../lib/prisma.service'
import { ActionResolver } from './action.resolver'
import { NavigateToJourneyActionResolver } from './navigateToJourney/navigateToJourney.resolver'
import { NavigateToBlockActionResolver } from './navigateToBlockAction/navigateToBlockAction.resolver'
import { LinkActionResolver } from './linkAction/linkAction.resolver'
import { NavigateActionResolver } from './navigateAction/navigateAction.resolver'
import { EmailActionResolver } from './emailAction/emailAction.resolver'

@Module({
  imports: [],
  providers: [
    ActionResolver,
    DateTimeScalar,
    JourneyService,
    PrismaService,
    LinkActionResolver,
    EmailActionResolver,
    NavigateActionResolver,
    NavigateToBlockActionResolver,
    NavigateToJourneyActionResolver
  ]
})
export class ActionModule {}
