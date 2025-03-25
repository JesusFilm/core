import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { PrismaService } from '../../lib/prisma.service'

import { JourneyEventResolver } from './journeyEvent.resolver'
import { JourneyEventService } from './journeyEvent.service'

@Module({
  imports: [CaslAuthModule],
  providers: [JourneyEventService, JourneyEventResolver, PrismaService],
  exports: [JourneyEventService]
})
export class JourneyEventModule {}
