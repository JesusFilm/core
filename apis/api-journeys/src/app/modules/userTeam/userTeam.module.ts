import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { prismaServiceProvider } from '../../lib/prisma.service'

import { UserTeamResolver } from './userTeam.resolver'
import { UserTeamService } from './userTeam.service'

@Global()
@Module({
  imports: [
    CaslAuthModule.register(AppCaslFactory),
    BullModule.registerQueue({ name: 'api-journeys-email' })
  ],
  providers: [UserTeamResolver, prismaServiceProvider, UserTeamService],
  exports: []
})
export class UserTeamModule {}
