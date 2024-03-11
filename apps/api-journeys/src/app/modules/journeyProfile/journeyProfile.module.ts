import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyProfileResolver } from './journeyProfile.resolver'
import { MailChimpService } from '../mailChimp/mailChimp.service'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyProfileResolver, MailChimpService, PrismaService],
  exports: []
})
export class JourneyProfileModule {}
