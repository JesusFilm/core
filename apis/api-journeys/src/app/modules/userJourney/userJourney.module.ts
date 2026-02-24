import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'

import { UserJourneyResolver } from './userJourney.resolver'
import { UserJourneyService } from './userJourney.service'

@Global()
@Module({
  imports: [
    CaslAuthModule.register(AppCaslFactory),
    BullModule.registerQueue({ name: 'api-journeys-email' })
  ],
  providers: [UserJourneyResolver, PrismaService, UserJourneyService],
  exports: []
})
export class UserJourneyModule {}
