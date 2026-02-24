import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyEventResolver } from './journeyEvent.resolver'
import { JourneyEventService } from './journeyEvent.service'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyEventService, JourneyEventResolver, PrismaService],
  exports: [JourneyEventService]
})
export class JourneyEventModule {}
