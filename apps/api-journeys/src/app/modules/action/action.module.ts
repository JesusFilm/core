import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { PrismaService } from '../../lib/prisma.service'

import { ActionResolver } from './action.resolver'
import { EmailActionResolver } from './emailAction/emailAction.resolver'
import { LinkActionResolver } from './linkAction/linkAction.resolver'
import { NavigateToBlockActionResolver } from './navigateToBlockAction/navigateToBlockAction.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [
    ActionResolver,
    DateTimeScalar,
    PrismaService,
    LinkActionResolver,
    EmailActionResolver,
    NavigateToBlockActionResolver
  ]
})
export class ActionModule {}
