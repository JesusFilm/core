import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { CustomDomainService } from '../customDomain/customDomain.service'

import { JourneyCollectionResolver } from './journeyCollection.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [JourneyCollectionResolver, PrismaService, CustomDomainService],
  exports: [JourneyCollectionResolver]
})
export class JourneyCollectionModule {}
