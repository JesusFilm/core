import { Global, Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { prismaServiceProvider } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { JourneyCustomizableService } from '../journey/journeyCustomizable.service'

import { VisitorResolver } from './visitor.resolver'
import { VisitorService } from './visitor.service'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [
    VisitorService,
    VisitorResolver,
    BlockService,
    JourneyCustomizableService,
    prismaServiceProvider
  ],
  exports: [VisitorService]
})
export class VisitorModule {}
