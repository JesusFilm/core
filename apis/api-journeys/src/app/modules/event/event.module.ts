import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { prismaServiceProvider } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'

import { ChatOpenEventResolver } from './button/button.resolver'
import { EventResolver } from './event.resolver'
import { EventService } from './event.service'
import {
  StepNextEventResolver,
  StepPreviousEventResolver
} from './step/step.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [
    BlockService,
    ChatOpenEventResolver,
    EventService,
    EventResolver,
    prismaServiceProvider,
    StepNextEventResolver,
    StepPreviousEventResolver,
    VisitorService
  ],
  exports: [EventService]
})
export class EventModule {}
