import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { PrismaService } from '../../lib/prisma.service'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [DateTimeScalar, PrismaService]
})
export class NexusModule {}
