import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'

import { ActionResolver } from './action.resolver'
import { ActionService } from './action.service'
import { EmailActionResolver } from './emailAction/emailAction.resolver'
import { LinkActionResolver } from './linkAction/linkAction.resolver'
import { NavigateToBlockActionResolver } from './navigateToBlockAction/navigateToBlockAction.resolver'
import { PhoneActionResolver } from './phoneAction/phoneAction.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [
    ActionService,
    ActionResolver,
    BlockService,
    DateTimeScalar,
    PrismaService,
    EmailActionResolver,
    LinkActionResolver,
    NavigateToBlockActionResolver,
    PhoneActionResolver
  ],
  exports: [ActionService]
})
export class ActionModule {}
