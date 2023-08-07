import { Global, Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { UserRoleResolver } from './userRole.resolver'
import { UserRoleService } from './userRole.service'

@Global()
@Module({
  imports: [],
  providers: [UserRoleService, UserRoleResolver, PrismaService],
  exports: [UserRoleService]
})
export class UserRoleModule {}
