import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { MailChimpService } from '../mailChimp/mailChimp.service'

import { JourneyProfileResolver } from './journeyProfile.resolver'

@Global()
@Module({
  imports: [
    CaslAuthModule.register(AppCaslFactory),
    BullModule.registerQueue({ name: 'api-journeys-profile-create' })
  ],
  providers: [JourneyProfileResolver, MailChimpService, PrismaService],
  exports: []
})
export class JourneyProfileModule {}
