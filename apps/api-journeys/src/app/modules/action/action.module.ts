import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { PrismaService } from '../../lib/prisma.service'

import { ActionResolver } from './action.resolver'
import { EmailActionResolver } from './emailAction/emailAction.resolver'
import { LinkActionResolver } from './linkAction/linkAction.resolver'
import { NavigateActionResolver } from './navigateAction/navigateAction.resolver'
import { NavigateToBlockActionResolver } from './navigateToBlockAction/navigateToBlockAction.resolver'
import { NavigateToJourneyActionResolver } from './navigateToJourneyAction/navigateToJourneyAction.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [
    ActionResolver,
    DateTimeScalar,
    PrismaService,
    LinkActionResolver,
    EmailActionResolver,
    NavigateActionResolver,
    NavigateToBlockActionResolver,
    NavigateToJourneyActionResolver
  ]
})
export class ActionModule {}
