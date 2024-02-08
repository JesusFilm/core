import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { UserTeamResolver } from './userTeam.resolver'
import { UserTeamService } from './userTeam.service'

@Global()
@Module({
  imports: [
    CaslAuthModule.register(AppCaslFactory),
    BullModule.registerQueue({ name: 'api-journeys-email' })
  ],
  providers: [UserTeamResolver, PrismaService, UserTeamService],
  exports: []
})
export class UserTeamModule {}
