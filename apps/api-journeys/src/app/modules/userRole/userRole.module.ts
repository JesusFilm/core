import { Global, Module } from '@nestjs/common'
import { JourneyService } from '../journey/journey.service'
import { PrismaService } from '../../lib/prisma.service'
import { UserRoleService } from './userRole.service'
import { UserRoleResolver } from './userRole.resolver'

@Global()
@Module({
  imports: [],
  providers: [UserRoleService, UserRoleResolver, JourneyService, PrismaService],
  exports: [UserRoleService]
})
export class UserRoleModule {}
