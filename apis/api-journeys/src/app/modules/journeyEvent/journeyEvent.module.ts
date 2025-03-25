import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyEventResolver } from './journeyEvent.resolver'
import { JourneyEventService } from './journeyEvent.service'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyEventService, JourneyEventResolver, PrismaService],
  exports: [JourneyEventService]
})
export class JourneyEventModule {}
