import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { HostResolver } from './host.resolver'

@Global()
@Module({
  imports: [DatabaseModule, CaslAuthModule.register(AppCaslFactory)],
  providers: [HostResolver, PrismaService],
  exports: [HostResolver]
})
export class HostModule {}
