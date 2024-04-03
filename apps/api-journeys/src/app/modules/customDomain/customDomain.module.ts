import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { CustomDomainResolver } from './customDomain.resolver'
import { CustomDomainService } from './customDomain.service'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [CustomDomainResolver, PrismaService, CustomDomainService],
  exports: [CustomDomainResolver]
})
export class CustomDomainModule {}
